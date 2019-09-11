import React from 'react'
import moment from 'moment'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import TYPES from './DataTypes'

import { Card, Row, Col, Statistic, Icon, Descriptions, Anchor, Button, Input, Tag, Tooltip, message } from 'antd'

import DataSection from './DataSection'

import GithubFetcher from '../scripts/GithubFetcher'

import { updateState, updateStatsField } from '../actions'

const CENTER_FLEX = { display: 'flex', placeContent: 'center' }
// const CENTER_LEFT_FLEX = { display: 'flex', justifyContent: 'flex-start', alignContent: 'center'}

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

    this.fetcher = new GithubFetcher('05c1acf261f6b223411c73d8b71cb1a30ce9186a')

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
    this.fetcher.testRepository(owner, name,
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
                <a className="header-title" href="/">
                  Github Stats
                </a>
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
              {Object.values(TYPES).map(value => (
                <Anchor.Link key={`anchor-link-${value}`} title={value} href={`#${value}`}/>
              ))}
            </Anchor>
          </div>

          <div className="content" >
            <DataSection
              type={TYPES.REPO}
              repos={repos}
              deleteRepo={deleteRepo}
            />

            <DataSection
              type={TYPES.STAR}
              repos={repos}
              deleteRepo={deleteRepo}
            />

            <DataSection
              type={TYPES.FORK}
              repos={repos}
              deleteRepo={deleteRepo}
            />

            <DataSection
              type={TYPES.RELEASE}
              repos={repos}
              deleteRepo={deleteRepo}
            />
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