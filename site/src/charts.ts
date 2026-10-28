// ECharts setup for the site: only the chart types and components used, one color
// per checker family in a fixed order, and light and dark steps of the same hues.
import { BarChart, CustomChart, LineChart, ScatterChart } from 'echarts/charts';
import { GridComponent, LegendComponent, MarkLineComponent, TooltipComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import type { EChartsCoreOption } from 'echarts/core';
import { SVGRenderer } from 'echarts/renderers';

echarts.use([BarChart, LineChart, ScatterChart, CustomChart, GridComponent, TooltipComponent, LegendComponent, MarkLineComponent, SVGRenderer]);

/**
 * Families in their fixed order. Colors are the first six categorical slots of
 * the validated default palette (blue, orange, aqua, yellow, magenta, green):
 * colorblind-safe between neighbors in both modes. Three light steps are below 3:1
 * contrast, so every mark carries a direct label and every chart has a table.
 */
export const FAMILIES = ['tsgo', 'tsrs', 'tsc-ts', 'bun', 'tsc-rs', 'tsc'] as const;
const LIGHT = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300'];
const DARK = ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300'];

export const isDark = (): boolean => window.matchMedia('(prefers-color-scheme: dark)').matches;

export function familyColor(family: string): string {
  const i = FAMILIES.indexOf(family as (typeof FAMILIES)[number]);
  return (isDark() ? DARK : LIGHT)[i] ?? '#8a8a85';
}

export function ink() {
  return isDark()
    ? { primary: '#f0efec', secondary: '#c3c2b7', muted: '#8f8e86', axis: '#3a3936', grid: '#2a2a28', surface: '#1a1a19' }
    : { primary: '#0b0b0b', secondary: '#52514e', muted: '#8a8984', axis: '#d9d8d3', grid: '#efeeea', surface: '#fcfcfb' };
}

/** Shared defaults: font, a quiet tooltip, recessive axes. */
export function base(): EChartsCoreOption {
  const c = ink();
  return {
    backgroundColor: 'transparent',
    textStyle: { fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif', color: c.secondary, fontSize: 12 },
    animationDuration: 500,
    animationEasing: 'cubicOut',
    tooltip: {
      backgroundColor: c.surface,
      borderColor: c.axis,
      borderWidth: 1,
      padding: [8, 12],
      textStyle: { color: c.primary, fontSize: 12 },
      extraCssText: 'border-radius: 10px; box-shadow: 0 10px 30px rgb(0 0 0 / 0.14);',
    },
  };
}

export function valueAxis(name?: string, formatter?: (v: number) => string) {
  const c = ink();
  return {
    type: 'value',
    name,
    nameTextStyle: { color: c.muted, fontSize: 11 },
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: c.muted, formatter },
    splitLine: { lineStyle: { color: c.grid } },
  };
}

export function categoryAxis(data: string[], extra: Record<string, unknown> = {}) {
  const c = ink();
  return {
    type: 'category',
    data,
    axisLine: { lineStyle: { color: c.axis } },
    axisTick: { show: false },
    axisLabel: { color: c.secondary },
    ...extra,
  };
}

const live = new Set<echarts.ECharts>();

/** Disposes every chart before the page re-renders its markup. */
export function disposeAll(): void {
  for (const chart of live) chart.dispose();
  live.clear();
}

export function mount(el: Element | null, option: EChartsCoreOption): void {
  if (!(el instanceof HTMLElement)) return;
  const chart = echarts.init(el, undefined, { renderer: 'svg' });
  chart.setOption({ ...base(), ...option });
  live.add(chart);
}

window.addEventListener('resize', () => {
  for (const chart of live) chart.resize();
});
