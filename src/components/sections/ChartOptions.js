/**
 * Common highchart options shared by
 * most of the charts
 */

import COLORS from './Colors'

export default {
  title: {
    text: undefined,
  },
  // xAxis: {
  //   type: 'datetime',
  // },
  legend: {
    itemStyle: {
      color: 'rgba(0, 0, 0, 0.85)',
      fontWeight: '300'
    }
  },
  colors: COLORS,
  tooltip: {
    shadow: false,
    split: true,
  },
  credits: {
    enabled: false,
  },
}