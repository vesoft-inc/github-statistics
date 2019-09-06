import React from 'react'
import PropTypes from 'prop-types'

import { Card, Row, Col, Statistic, Icon, Descriptions, Anchor, Button, Input, Tag, Tooltip, message } from 'antd'
import { LineChart, Label, AreaChart, Line, Area, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Legend, Tooltip as ChartToolTip } from 'recharts'

import COLORS from './Colors'

const CENTER_FLEX = { display: 'flex', placeContent: 'center' }

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
      <div>
        {Array.from(stats.entries()).map((
          pair => {
            if (ready.get(pair[0])) {
              const { totalStar, maxIncrement, createdAt } = pair[1]
              const dateSinceCreated = Math.floor((Date.now() - new Date(createdAt).valueOf()) / (24*60*60*1000))
              const averageStarPerDay = totalStar / dateSinceCreated
              return (
                <Row key={"star-statistics" + pair[0]}>
                  <Col span={8}><Card bordered={false}>
                    <Statistic title="Total Stars" value={totalStar} prefix={<Icon type="star" />} />
                  </Card></Col>
                  <Col span={8}><Card bordered={false}>
                    <Statistic title="Avg. stars/day" value={averageStarPerDay} precision={2} />
                  </Card></Col>
                  <Col span={8}><Card bordered={false}>
                    <Statistic title="Max. stars/day" value={maxIncrement} />
                  </Card></Col>
                </Row>
              )
            }
            return
          }
        ))}

      </div>
    )
  }

  _renderCharts = () => {
    const { ready } = this.props

    if (!Array.from(ready.values()).includes(true)) return

    const seriesStarTotal = this._getStarTotalData()
    const seriesStarIncrement = this._getStarIncrementData()
    return (
      <div>
        <Row>
          <Card bordered={false} bodyStyle={CENTER_FLEX}>
            <ResponsiveContainer width="80%" height={300}>
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
          </Card>
          <Card bordered={false} bodyStyle={CENTER_FLEX}>
            <ResponsiveContainer width="80%" height={300}>
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
          </Card>
        </Row>
      </div>
    )
  }

  render() {
    return (
      <div>
        {this._renderStatistics()}
        {this._renderCharts()}
      </div>
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