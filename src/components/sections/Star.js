import React from 'react'
import PropTypes from 'prop-types'

import { Card, Row, Col, Statistic, Icon, Descriptions, Anchor, Button, Input, Tag, Tooltip, message } from 'antd'
import { LineChart, AreaChart, Line, Area, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Brush, Tooltip as ChartToolTip } from 'recharts'


const CENTER_FLEX = { display: 'flex', placeContent: 'center' }

class Star extends React.Component {

  // _getStarIncrementData = () => {
  //   const { data } = this.props
  //   const formattedData = []
  //   data.forEach((value, key) => {
  //     formattedData.push({
  //       date: key,
  //       stars: value,
  //     })
  //   })
  //   return formattedData
  // }

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
                    <Statistic title="Avg. star/day" value={averageStarPerDay} precision={2} />
                  </Card></Col>
                  <Col span={8}><Card bordered={false}>
                    <Statistic title="Max increment a day" value={maxIncrement} />
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
    return (
      <div>
        <Row>
        Total Stars
        </Row>
        <Row>
          <Card bordered={false} bodyStyle={CENTER_FLEX}>
            <ResponsiveContainer width="80%" height={300}>
              <AreaChart>
                <defs>
                  <linearGradient id="starGradientArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffb900" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ffb900" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#ccc" strokeDasharray="2 7" />
                <Brush data={seriesStarTotal} dataKey="date"/>
                <XAxis
                  dataKey="date"
                  scale="time"
                  allowDuplicatedCategory={false}
                  type="number"
                  domain = {['auto', 'auto']}
                  tickFormatter={ms => new Date(ms).toISOString().slice(0,10)}
                />
                <YAxis dataKey="value"/>
                <ChartToolTip labelFormatter={ms => new Date(ms).toISOString().slice(0,10)}/>
                {seriesStarTotal.map(serie => (
                  <Area
                    type="monotone"
                    key={"star-chart-area" + serie.name}
                    data={serie.data}
                    dataKey="value"
                    name={serie.name}
                    stroke="#ffb900"
                    fill={"url(#starGradientArea)"}
                    dot={false}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Row>
        {/* <Row>
        Daily increment
      </Row>
      <Row>
        <Card bordered={false} bodyStyle={CENTER_FLEX}>
          <ResponsiveContainer width="80%" height={300}>
            <LineChart data={this._getStarIncrementData()}>
              <Line type="monotone" dataKey="stars" stroke="#ffb900" dot={false}/>
              <CartesianGrid stroke="#ccc" strokeDasharray="3 7" />
              <XAxis
                dataKey="date"
                domain = {['auto', 'auto']}
                type="number"
                tickFormatter={ms => new Date(ms).toISOString().slice(0,10)}
              />
              <YAxis />
              <ChartToolTip
                // formatter={(value, name) => [value, new Date(name).toISOString().slice(0,10)]}
                labelFormatter={ms => new Date(ms).toISOString().slice(0,10)}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </Row> */}
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