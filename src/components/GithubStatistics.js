import React from 'react'
import moment from 'moment'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import TYPES from './DataTypes'

import { Card, Row, Col, Statistic, Icon, Descriptions, Anchor, Button, Input, Tag, Tooltip, message } from 'antd'
import { LineChart, AreaChart, Line, Area, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip as ChartToolTip } from 'recharts'

import DataSection from './DataSection'

import GithubFetcher from '../scripts/GithubFetcher'

import { updateState, updateStatsField } from '../actions'

const CENTER_FLEX = { display: 'flex', placeContent: 'center' }
const CENTER_LEFT_FLEX = { display: 'flex', justifyContent: 'flex-start', alignContent: 'center'}

// message.config({
//   top: 60,
//   duration: 2,
//   maxCount: 5,
// })

class GithubStatistics extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      repos:[],
      input: '',
      testingRepo: false,
      deleteRepo: '',
    }

    this.GithubFetcher = new GithubFetcher('05c1acf261f6b223411c73d8b71cb1a30ce9186a')

    this.props.updateState("githubApiToken", '05c1acf261f6b223411c73d8b71cb1a30ce9186a')
  }

  deleteRepo = index => {
    const { repos } = this.state
    const deleteRepo = repos[index]
    repos.splice(index,1)
    this.setState({
      repos: [...repos],
      deleteRepo: deleteRepo,
    })
  }

  addRepo = repo => {
    const { repos } = this.state
    this.setState({
      repos: [ ...repos, repo],
      deleteRepo: '',
    })
  }

  handleAdding = repo => {
    const slashIndex = repo.indexOf('/')
    const owner = repo.slice(0, slashIndex)
    const name = repo.slice(slashIndex + 1)

    this.setState({ testingRepo: true })
    this.GithubFetcher.testRepository(owner, name,
      result => {
        this.setState({ testingRepo: false })
        if (result) {
          this.addRepo(repo)
          message.success(repo + ' added')
        } else {
          message.error('Repository not found')
        }
      }
    )
  }

  _fetchRepositoryData = () => ({
    type: this.GithubFetcher.fetchRepositoryData,
    onFinish: stats => {
      this.props.updateState('repoStats', stats)
    }
  })

  _fetchStargazerData = () => ({
    type: this.GithubFetcher.fetchStargazerData,
    onUpdate: data => {
      this.props.updateState('starData', data)
    },
    onFinish: stats => {
      this.props.updateState('starStats', stats)
    }
  })

  _fetchForkData = () => ({
    type: this.GithubFetcher.fetchForkData,
    onUpdate: data => {
      this.props.updateState('forkData', data)
    },
    onFinish: stats => {
      this.props.updateState('forkStats', stats)
    }
  })

  _fetchReleaseData = () => ({
    type: this.GithubFetcher.fetchReleaseData,
    onUpdate: data => {
      this.props.updateState('releaseData', data)
    },
    onFinish: stats => {
      this.props.updateState('releaseStats', stats)
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

  _renderReleaseStatistics = () => {
    const { totalAssets, name, tagName, createdAt, totalDownloads } = this.props.releaseStats

    const dateSinceCreated = Math.floor((Date.now() - new Date(createdAt).valueOf()) / (24*60*60*1000))
    const averageDownloadsPerDay = totalDownloads / dateSinceCreated

    return (
      <div>
        <Row>
          <Col span={12}><Card bordered={false}>
            <Statistic title="Release tag" value={tagName} />
          </Card></Col>
          <Col span={12}><Card bordered={false}>
            <Statistic title="Release name" value={name} />
          </Card></Col>
        </Row>
        <Row>
          <Col span={8}><Card bordered={false}>
            <Statistic title="Total assets" value={totalAssets} />
          </Card></Col>
          <Col span={8}><Card bordered={false}>
            <Statistic title="Total asset downlaods" value={totalDownloads} prefix={<Icon type="download"/>} />
          </Card></Col>
          <Col span={8}><Card bordered={false}>
            <Statistic title="Avg. downloads/day" value={averageDownloadsPerDay} precision={2} />
          </Card></Col>
        </Row>
        {this.props.releaseData.map(asset => (
          <Card key={asset.id} bordered={false} bodyStyle={CENTER_FLEX}>
            <Descriptions bordered size="small" layout="vertical" style={{ width: '80%' }}>
              <Descriptions.Item label="Asset">{asset.name}</Descriptions.Item>
              <Descriptions.Item label="Content type">{asset.contentType}</Descriptions.Item>
              <Descriptions.Item label="Downloads">{asset.downloadCount}</Descriptions.Item>
              <Descriptions.Item label="Created at">{moment(asset.createdAt).format("MMMM Do YYYY, h:mm:ss a")}</Descriptions.Item>
              <Descriptions.Item label="Updated at">{moment(asset.updatedAt).format("MMMM Do YYYY, h:mm:ss a")}</Descriptions.Item>
            </Descriptions>
          </Card>
        ))}
      </div>
    )
  }



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
              <ChartToolTip
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
              <ChartToolTip
                // formatter={(value, name) => [value, new Date(name).toISOString().slice(0,10)]}
                labelFormatter={ms => new Date(ms).toISOString().slice(0,10)}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </Row>
    </div>
  )

  _renderTags = () => {
    const { repos } = this.state

    return (
      repos.map((repo, index) => (
        <Tag key={"tag" + repo} closable onClose={() => this.deleteRepo(index)}>
          {repo}
        </Tag>
      ))
    )
  }

  _renderHeaderInput = () => {
    const { repos, input, testingRepo } = this.state

    const format = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}\/{1}[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i

    let hintMessage = ''

    // Conditions
    const inputEmpty = input === ''
    const formatIncorrect = !format.test(input)
    const repoExisted = repos.includes(input)

    if (repoExisted) hintMessage = 'Repository already added'
    if (formatIncorrect) hintMessage = 'Input incorrectly formatted'
    if (inputEmpty) hintMessage = 'Empty'

    const disabled = inputEmpty || formatIncorrect || repoExisted

    return (
      <React.Fragment>
        <Input
          className="header-input"
          prefix={<Icon type="github"/>}
          placeholder="owner/name"
          value={input}
          onChange={e => this.setState({ input: e.target.value })}
          onPressEnter={() => !disabled && this.handleAdding(input)}
          disabled={testingRepo}
          allowClear
        />
        <Tooltip
          title={hintMessage}
        >
          <Button
            icon="plus"
            loading={testingRepo}
            disabled={disabled}
            onClick={() => this.handleAdding(input)}
          >
            ADD
          </Button>
        </Tooltip>
      </React.Fragment>
    )
  }

  render() {
    // const dotStyle = {strokeWidth: 2, r: 2.5}
    const { repos, deleteRepo } = this.state

    return (
      <div>
        <header>
          <div className="header">
            <Row type="flex" align="middle">
              <Col className="header-section">
                <span className="header-title">
                  Github Stats
                </span>
              </Col>
              <Col className="header-section flex-center">
                {this._renderHeaderInput()}
              </Col>
              <Col className="header-section flex-center-left">
                {this._renderTags()}
              </Col>
            </Row>
          </div>
        </header>
        <div className="container">
          <div className="sider">
            <Anchor bounds={0} className="anchor">
              <Anchor.Link title="Repository" href="#Repository" />
              <Anchor.Link title="Star" href="#Star" />
              <Anchor.Link title="Fork" href="#Fork" />
              <Anchor.Link title="Release" href="#Release" />
            </Anchor>
          </div>

          <div className="content" >
            <DataSection
              id="Star"
              type={TYPES.STAR}
              repos={repos}
              deleteRepo={deleteRepo}
            />

            {/* <DataUnit
              id="Repository"
              title="Repository"
              iconType="book"
              iconColor="#000"
              action={this._fetchRepositoryData()}
            >
              {this._renderRepositoryStatistics()}
            </DataUnit>

            <DataUnit
              id="Star"
              title="Star Trend"
              iconType="star"
              iconColor="#ffb900"
              action={this._fetchStargazerData()}
            >
              {this._renderStarStatistics()}
              {this._renderStarCharts()}
            </DataUnit>

            <DataUnit
              id="Fork"
              title="Forks"
              iconType="fork"
              iconColor="#333"
              action={this._fetchForkData()}
            >
              {this._renderForkStatistics()}
              {this._renderForkCharts()}
            </DataUnit>

            <DataUnit
              id="Release"
              title="Latest Release"
              iconType="tag"
              iconColor="#333"
              action={this._fetchReleaseData()}
            >
              {this._renderReleaseStatistics()}
            </DataUnit> */}
          </div>
        </div>
      </div>
    )
  }
}

GithubStatistics.propTypes = {
  updateState: PropTypes.func,
  updateStatsField: PropTypes.func,

  repoStats: PropTypes.object,
  starStats: PropTypes.object,
  starData: PropTypes.any,
  forkStats: PropTypes.object,
  forkData: PropTypes.any,
  releaseStats: PropTypes.object,
  releaseData: PropTypes.any,
}

const mapStateToProps = state => ({
  repoStats: state.github.repoStats,
  starStats: state.github.starStats,
  starData: state.github.starData,
  forkStats: state.github.forkStats,
  forkData: state.github.forkData,
  releaseStats: state.github.releaseStats,
  releaseData: state.github.releaseData,
})

const mapDispatchToProps = dispatch => ({
  updateState: (state, data) => dispatch(updateState(state, data)),
  updateStatsField: (state, stats) => dispatch(updateStatsField(state, stats))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GithubStatistics)