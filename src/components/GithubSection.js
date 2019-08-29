import React from 'react'
import moment from 'moment'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import { Card, Row, Col, Statistic, Icon } from 'antd'
import { LineChart, AreaChart, Line, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

import DataUnit from './DataUnit'

import GithubRepoScript from '../scripts/GithubRepoScript'

import { updateState, updateStatsField } from '../actions'

const CENTER_FLEX = { display: 'flex', justifyContent: 'center', alignContent: 'center' }


class GithubSection extends React.Component {
  constructor(props) {
    super(props)

    this.GithubRepoScript = new GithubRepoScript()
  }

  _fetchRepositoryData = () => ({
    type: this.GithubRepoScript.fetchRepositoryData,
    onFinish: stats => {
      this.props.updateState('repoStats', stats)
    }
  })

  _fetchStargazerData = () => ({
    type: this.GithubRepoScript.fetchStargazerData,
    onUpdate: data => {
      this.props.updateState('starData', data)
    },
    onFinish: stats => {
      this.props.updateState('starStats', stats)
    }
  })

  _fetchForkData = () => ({
    type: this.GithubRepoScript.fetchForkData,
    onUpdate: data => {
      this.props.updateState('forkData', data)
    },
    onFinish: stats => {
      this.props.updateState('forkStats', stats)
    }
  })

  _getStarIncrementData = () => {
    const { starData, starStats, updateStatsField } = this.props
    const formattedData = []
    starData.forEach((value, key) => {
      formattedData.push({
        date: key,
        stars: value,
      })
      if (!starStats.maxIncrement || value > starStats.maxIncrement) {
        updateStatsField('starStats', { maxIncrement: value })
      }
    })
    return formattedData
  }

  _getStarTotalData = () => {
    const { starData } = this.props
    const formattedData = []
    let cumulativeStarCount = 0
    starData.forEach((value, key) => {
      cumulativeStarCount += value
      formattedData.push({
        date: key,
        stars: cumulativeStarCount,
      })
    })
    return formattedData
  }

  _getForkIncrementData = () => {
    const { forkData, forkStats, updateStatsField } = this.props
    const formattedData = []
    forkData.forEach((value, key) => {
      formattedData.push({
        date: key,
        forks: value,
      })
      if (!forkStats.maxIncrement || value > forkStats.maxIncrement) {
        updateStatsField('forkStats', { maxIncrement: value })
      }
    })
    return formattedData
  }

  _getForkTotalData = () => {
    const { forkData } = this.props
    const formattedData = []
    let cumulativeForkCount = 0
    forkData.forEach((value, key) => {
      cumulativeForkCount += value
      formattedData.push({
        date: key,
        forks: cumulativeForkCount,
      })
    })
    return formattedData
  }

  _renderRepositoryStatistics = () => {
    const { name, createdAt, primaryLanguage, pushedAt, watcherCount } = this.props.repoStats

    const dateSinceCreated = Math.floor((Date.now() - new Date(createdAt).valueOf()) / (24*60*60*1000))

    return (
      <div>
        <Row>
          <Col span={8}><Card bordered={false}>
            <Statistic title="Repository" value={name} />
          </Card></Col>
          <Col span={8}><Card bordered={false}>
            <Statistic title="Date created" value={new Date(createdAt).toDateString()} />
          </Card></Col>
          <Col span={8}><Card bordered={false}>
            <Statistic title="Days since created" value={dateSinceCreated} />
          </Card></Col>
        </Row>
        <Row>
          <Col span={8}><Card bordered={false}>
            <Statistic title="Primary language" value={primaryLanguage} />
          </Card></Col>
          <Col span={8}><Card bordered={false}>
            <Statistic title="Last push at" value={moment(pushedAt).fromNow()} />
          </Card></Col>
          <Col span={8}><Card bordered={false}>
            <Statistic title="Watchers" prefix={<Icon type="eye"/>} value={watcherCount} />
          </Card></Col>
        </Row>
      </div>
    )
  }

  _renderStarStatistics = () => {
    const { totalStar, maxIncrement, createdAt } = this.props.starStats

    const dateSinceCreated = Math.floor((Date.now() - new Date(createdAt).valueOf()) / (24*60*60*1000))
    const averageStarPerDay = totalStar / dateSinceCreated

    return (
      <div>
        <Row>
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
      </div>
    )
  }

  _renderForkStatistics = () => {
    const { totalFork, maxIncrement, createdAt } = this.props.forkStats

    const dateSinceCreated = Math.floor((Date.now() - new Date(createdAt).valueOf()) / (24*60*60*1000))
    const averageForkPerDay = totalFork / dateSinceCreated

    return (
      <div>
        <Row>
          <Col span={8}><Card bordered={false}>
            <Statistic title="Total public forks" value={totalFork} prefix={<Icon type="star" />} />
          </Card></Col>
          <Col span={8}><Card bordered={false}>
            <Statistic title="Avg. fork/day" value={averageForkPerDay} precision={2} />
          </Card></Col>
          <Col span={8}><Card bordered={false}>
            <Statistic title="Max increment a day" value={maxIncrement} />
          </Card></Col>
        </Row>
      </div>
    )
  }

  _renderStarCharts = () => (
    <div>
      <Row>
        Total Stars
      </Row>
      <Row>
        <Card bordered={false} bodyStyle={CENTER_FLEX}>
          <ResponsiveContainer width="80%" height={300}>
            <AreaChart data={this._getStarTotalData()}>
              <defs>
                <linearGradient id="starGradientArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffb900" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ffb900" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="stars" stroke="#ffb900" fill={"url(#starGradientArea)"} dot={false}/>
              <CartesianGrid stroke="#ccc" strokeDasharray="2 7" />
              <XAxis
                dataKey="date"
                domain = {['auto', 'auto']}
                type="number"
                tickFormatter={ms => new Date(ms).toISOString().slice(0,10)}
              />
              <YAxis />
              <Tooltip
              // formatter={(value, name) => [value, new Date(name).toISOString().slice(0,10)]}
                labelFormatter={ms => new Date(ms).toISOString().slice(0,10)}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </Row>
      <Row>
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
              <Tooltip
                // formatter={(value, name) => [value, new Date(name).toISOString().slice(0,10)]}
                labelFormatter={ms => new Date(ms).toISOString().slice(0,10)}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </Row>
    </div>
  )

  _renderForkCharts = () => (
    <div>
      <Row>
        Total Forks
      </Row>
      <Row>
        <Card bordered={false} bodyStyle={CENTER_FLEX}>
          <ResponsiveContainer width="80%" height={300}>
            <AreaChart data={this._getForkTotalData()}>
              <defs>
                <linearGradient id="forkGradientArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#333" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#333" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="forks" stroke="#333" fill={"url(#forkGradientArea)"} dot={false}/>
              <CartesianGrid stroke="#ccc" strokeDasharray="2 7" />
              <XAxis
                dataKey="date"
                domain = {['auto', 'auto']}
                type="number"
                tickFormatter={ms => new Date(ms).toISOString().slice(0,10)}
              />
              <YAxis />
              <Tooltip
              // formatter={(value, name) => [value, new Date(name).toISOString().slice(0,10)]}
                labelFormatter={ms => new Date(ms).toISOString().slice(0,10)}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </Row>
      <Row>
        Daily increment
      </Row>
      <Row>
        <Card bordered={false} bodyStyle={CENTER_FLEX}>
          <ResponsiveContainer width="80%" height={300}>
            <LineChart data={this._getForkIncrementData()}>
              <Line type="monotone" dataKey="forks" stroke="#333" dot={false}/>
              <CartesianGrid stroke="#ccc" strokeDasharray="3 7" />
              <XAxis
                dataKey="date"
                domain = {['auto', 'auto']}
                type="number"
                tickFormatter={ms => new Date(ms).toISOString().slice(0,10)}
              />
              <YAxis />
              <Tooltip
                // formatter={(value, name) => [value, new Date(name).toISOString().slice(0,10)]}
                labelFormatter={ms => new Date(ms).toISOString().slice(0,10)}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </Row>
    </div>
  )

  render() {
    // const dotStyle = {strokeWidth: 2, r: 2.5}
    return (
      <Card bordered={false} className="Section-div">
        <DataUnit
          title="Repository"
          iconType="book"
          iconColor="#000"
          action={this._fetchRepositoryData()}
        >
          {this._renderRepositoryStatistics()}
        </DataUnit>

        <DataUnit
          title="Star Trend"
          iconType="star"
          iconColor="#ffb900"
          action={this._fetchStargazerData()}
        >
          {this._renderStarStatistics()}
          {this._renderStarCharts()}
        </DataUnit>

        <DataUnit
          title="Forks"
          iconType="fork"
          iconColor="#333"
          action={this._fetchForkData()}
        >
          {this._renderForkStatistics()}
          {this._renderForkCharts()}
        </DataUnit>
      </Card>
    )
  }
}

GithubSection.propTypes = {
  updateState: PropTypes.func,
  updateStatsField: PropTypes.func,

  repoStats: PropTypes.object,
  starStats: PropTypes.object,
  starData: PropTypes.any,
  forkStats: PropTypes.object,
  forkData: PropTypes.any,
}

const mapStateToProps = state => ({
  repoStats: state.github.repoStats,
  starStats: state.github.starStats,
  starData: state.github.starData,
  forkStats: state.github.forkStats,
  forkData: state.github.forkData,
})

const mapDispatchToProps = dispatch => ({
  updateState: (state, data) => dispatch(updateState(state, data)),
  updateStatsField: (state, stats) => dispatch(updateStatsField(state, stats))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GithubSection)