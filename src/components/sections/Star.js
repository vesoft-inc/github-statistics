import React from 'react'
import PropTypes from 'prop-types'

import { Row, Statistic, Icon, Tag } from 'antd'
import { LineChart, Line, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Legend, Tooltip as ChartToolTip } from 'recharts'

import COLORS from './Colors'


class Star extends React.Component {

  _getStarIncrementData = () => {
    const { data, ready } = this.props
    const series = []
    data.forEach((datamap, repo) => {
      let data = []
      if (!ready.get(repo)) return
      datamap.forEach((value, key) => {
        data.push({
          date: key,
          value: value,
        })
      })
      series.push({ name: repo, data })
    })
    console.log('this bitch is called once')
    return series
  }

  _getStarTotalData = () => {
    const { data, ready } = this.props
    const series = []
    data.forEach((datamap, repo) => {
      let cumulativeStarCount = 0
      let data = []
      if (!ready.get(repo)) return
      datamap.forEach((value, key) => {
        cumulativeStarCount += value
        data.push({
          date: key,
          value: cumulativeStarCount,
        })
      })
      series.push({ name: repo, data })
    })
    return series
  }

  _renderStatistics = () => {
    const { stats, ready } = this.props

    return (
      <>
      {Array.from(stats.entries()).map((
        (pair, index) => {
          if (ready.get(pair[0])) {
            const { totalStar, maxIncrement, createdAt } = pair[1]
            const dateSinceCreated = Math.floor((Date.now() - new Date(createdAt).valueOf()) / (24*60*60*1000))
            const averageStarPerDay = totalStar / dateSinceCreated
            return (
              <div key={`star-statistics-${pair[0]}`}>
                <Row>
                  <Tag color={COLORS[index]}>
                    {pair[0]}
                  </Tag>
                  <Row>
                  </Row>
                  <span className="stats-card">
                    <Statistic title="Total stars" value={totalStar} prefix={<Icon type="star" />} />
                  </span>
                  <span className="stats-card">
                    <Statistic title="Avg. stars/day" value={averageStarPerDay} precision={2} />
                  </span>
                  <span className="stats-card">
                    <Statistic title="Max. stars/day" value={maxIncrement} />
                  </span>
                </Row>
              </div>
            )
          }
          return
        }
      ))}
      </>
    )
  }

  _renderCharts = () => {
    const { ready } = this.props

    if (!Array.from(ready.values()).includes(true)) return

    const seriesStarTotal = this._getStarTotalData()
    const seriesStarIncrement = this._getStarIncrementData()
    return (
      <>
      <Row>
        <div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart>
              <CartesianGrid stroke="#ccc" strokeDasharray="2 7" />
              <Legend verticalAlign="top"/>
              <XAxis
                dataKey="date"
                scale="time"
                allowDuplicatedCategory={false}
                type="number"
                domain = {['auto', 'auto']}
                tickFormatter={ms => new Date(ms).toISOString().slice(0,10)}
              />
              <YAxis dataKey="value" label={{ value: 'total stars', angle: -90, position: 'insideBottomLeft' }}/>
              <ChartToolTip labelFormatter={ms => new Date(ms).toISOString().slice(0,10)}/>
              {seriesStarTotal.map((serie, index) => (
                <Line
                  type="monotone"
                  key={`star-chart-total-${serie.name}`}
                  data={serie.data}
                  dataKey="value"
                  name={serie.name}
                  stroke={COLORS[index]}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart>
              <CartesianGrid stroke="#ccc" strokeDasharray="2 7" />
              <Legend verticalAlign="top"/>
              <XAxis
                dataKey="date"
                scale="time"
                allowDuplicatedCategory={false}
                type="number"
                domain = {['auto', 'auto']}
                tickFormatter={ms => new Date(ms).toISOString().slice(0,10)}
              />
              <YAxis dataKey="value" label={{ value: 'daily increment', angle: -90, position: 'insideBottomLeft' }}/>
              <ChartToolTip labelFormatter={ms => new Date(ms).toISOString().slice(0,10)}/>
              {seriesStarIncrement.map((serie, index) => (
                <Line
                  type="monotone"
                  key={`star-chart-increment-${serie.name}`}
                  data={serie.data}
                  dataKey="value"
                  name={serie.name}
                  stroke={COLORS[index]}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Row>
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

Star.propTypes = {
  id: PropTypes.string,
  repos: PropTypes.array,
  data: PropTypes.objectOf(Map),
  stats: PropTypes.objectOf(Map),
  ready: PropTypes.objectOf(Map),
}


export default Star