import React from 'react'
import PropTypes from 'prop-types'

import { Row, Statistic, Icon, Tag } from 'antd'
// import { LineChart, Line, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Legend, Tooltip as ChartToolTip } from 'recharts'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'

import COLORS from './Colors'
import OPTIONS from './ChartOptions'


class Fork extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isReset: false,
      arr: []
    }
  }

  static formatter = (repo, data) => {
    // issues total data, index 0
    let total = { name: repo, data: [] }
    // issues  daily increment data, index 1
    let increment = { name: repo, data: [] }
    let cumulativeCount = 0
    let arrayObj = Array.from(data);
    arrayObj.sort(function (a, b) {
      return a[0] - b[0];
    })
    arrayObj.forEach((value, key) => {
      cumulativeCount += value[1]
      total.data.push([value[0], cumulativeCount])
      
      increment.data.push([value[0], value])
    })
    return [total, increment]
  }

  shouldComponentUpdate(nextProps) {
    return !nextProps.loading && !Array.from(nextProps.ready.values()).includes(false)
  }

  cloneMap(map) {
    let obj = Object.create(null)
    for (let [k, v] of map) {
      obj[k] = v
    }
    obj = JSON.parse(JSON.stringify(obj))
    let tmpMap = new Map()
    for (let k of Object.keys(obj)) {
      tmpMap.set(k, obj[k])
    }
    return tmpMap
  }

  componentWillReceiveProps(props) {
    this.setState({
      arr: this.cloneMap(props.data)
    })
  }

  resetData(min, max) {
    Array.from(this.state.arr.values()).map(dataArray => dataArray[0]).forEach((value, index) => {
      let initial = 0
      value.data.forEach((obj, index) => {
        if (min <= obj[0] && max >= obj[0]) {
          if (!initial) {
            initial = obj[1]
            value.data[index - 1] = 0
          }
        }
        if (obj) {
          obj[1] -= initial
        }
      })
    })
    this.setState({
      isReset: true
    })
  }

  _renderStatistics = () => {
    const { stats, ready } = this.props

    return (
      <>
      {Array.from(stats.entries()).map((
        (pair, index) => {
          if (ready.get(pair[0])) {
            const { total, maxIncrement, createdAt } = pair[1]
            const dateSinceCreated = Math.floor((Date.now() - new Date(createdAt).valueOf()) / (24*60*60*1000))
            const averagePerDay = total / dateSinceCreated
            return (
              <div key={`fork-statistics-${pair[0]}`}>
                <Row>
                  <Tag color={COLORS[index]}>
                    {pair[0]}
                  </Tag>
                  <Row type="flex" align="middle" justify="space-between">
                    <span className="stats-card">
                      <Statistic title="Total issues" value={total} prefix={<Icon type="info-circle" />} />
                    </span>
                    <span className="stats-card">
                      <Statistic title="Avg. issues/day" value={averagePerDay} precision={2} />
                    </span>
                    <span className="stats-card">
                      <Statistic title="Max. issues/day" value={maxIncrement} />
                    </span>
                  </Row>
                </Row>
              </div>
            )
          }
          return false
        }
      ))}
      </>
    )
  }

  _renderCharts = () => {
    const { data, ready } = this.props

    if (!Array.from(ready.values()).includes(true)) return

    return (
      <>
      <HighchartsReact
        highcharts={Highcharts}
        options={{ ...OPTIONS,
          chart: {
            events: {
              selection: (event) => {
                if (!event.resetSelection) {
                  var min = event.xAxis[0].min;
                  var max = event.xAxis[0].max;
                  this.resetData(min, max)
                } else {
                  this.setState({
                    arr: this.cloneMap(data)
                  })
                }
              }
            },
            zoomType: 'x',
            type: 'line'
          },
          xAxis: {
            type: 'datetime',
          },
          yAxis: {
            gridLineWidth: 0,
            title: {
              text: 'total issues',
            },
          },
          series: Array.from(this.state.arr.values()).map(dataArray => dataArray[0]),
        }}
      />
      <HighchartsReact
        highcharts={Highcharts}
        options={{ ...OPTIONS,
          chart: {
            type: 'column',
            zoomType: 'x',
          },
          xAxis: {
            type: 'datetime',
          },
          yAxis: {
            gridLineWidth: 0,
            title: {
              text: 'fork increment/day',
            },
          },
          series: Array.from(data.values()).map(dataArray => dataArray[1]),
        }}
      />
      </>
    )
  }

  render() {
    return (
      <>
      {this._renderStatistics()}
      {this._renderCharts()}
      </>
    )
  }
}

Fork.propTypes = {
  id: PropTypes.string,
  repos: PropTypes.array,
  data: PropTypes.objectOf(Map),
  stats: PropTypes.objectOf(Map),
  ready: PropTypes.objectOf(Map),
  loading: PropTypes.bool,
}


export default Fork