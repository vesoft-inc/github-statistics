import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
// import _ from 'lodash'

import TYPES from './DataTypes'
import '../css/DataSection.css'

import { Card, Progress, Button, Row, Col, Icon, Tag } from 'antd'
import GithubFetcher from '../scripts/GithubFetcher'

import Star from './sections/Star'

class DataSection extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      progress: new Map(),
      data: new Map(),
      stats: new Map(),
      visible: new Map(),
      ready: new Map(),
      loading: false,
    }

    const { githubApiToken } = this.props
    this.fetcher = new GithubFetcher(githubApiToken)
  }

  componentDidUpdate(prevProps) {
    const { deleteRepo, repos } = this.props
    const { data, stats, progress, visible, loading, ready } = this.state

    // delete repo out
    if (deleteRepo !== prevProps.deleteRepo && deleteRepo !== '') {
      data.delete(deleteRepo)
      stats.delete(deleteRepo)
      progress.delete(deleteRepo)
      ready.delete(deleteRepo)
      visible.delete(deleteRepo)
      this.setState({ data, stats, progress, ready, visible, loading: this._getAllProgress() !== 100 && loading && repos.length !== 0 })
    }

    // new repo in
    if (prevProps.repos !== repos && deleteRepo === '') {
      const newRepo = repos.filter(repo => !prevProps.repos.includes(repo))
      newRepo.forEach(repo => {
        data.set(repo, {})
        stats.set(repo, {})
        progress.set(repo, 0)
        ready.set(repo, false)
        visible.set(repo, true)
        this.setState({ data, stats, progress, ready, visible })
        if (loading) {
          this._fetch(repo)
        }
      })
    }
  }

  /**
   * fetching from a specific repository
   * for a specific data type from DataTypes.js
   * @param repo repo to fectch
   * @returns exit status string
   */
  _fetch = repo => {
    const { type, repos } = this.props
    const slashIndex = repo.indexOf('/')
    const owner = repo.slice(0, slashIndex)
    const name = repo.slice(slashIndex + 1)

    const onUpdate = data => {
      if(this.state.data.has(repo)) {
        this.state.data.set(repo, data)
        this.setState({ data: this.state.data })
      }
    }
    const onFinish = stats => {
      if(this.state.stats.has(repo)) {
        this.state.stats.set(repo, stats)
        this.state.ready.set(repo, true)
        this.setState({ stats: this.state.stats, ready: this.state.ready})
      }
      if (this._getAllProgress() === 100) {
        this.setState({ loading: false })
      }
    }
    const onProgress = progress => {
      if(this.state.progress.has(repo)) {
        this.state.progress.set(repo,progress)
        this.setState({
          progress:this.state.progress
        })
      }
    }
    const shouldAbort = () => {
      // if (this._getAllProgress() === 100) {
      //   this.setState({ loading: false })
      // }
      return !repos.includes(repo)
    }

    switch (type) {
      case TYPES.STAR:
        this.fetcher.fetchStargazerData(
          owner, name,
          onUpdate,
          onFinish,
          onProgress,
          shouldAbort,
        )
        break
      default:
        console.log('TYPE DOESNOT EXIST')
        return 'ERROR'
    }
    return 'FETCH REQUESTED'
  }

  /**
   * get progress of fetching all
   * @returns progress as number from 0 to 100
   */
  _getAllProgress = () => {
    const { progress } = this.state
    return Array.from(progress.values()).reduce((a, b) => a + b, 0)
    / (progress.size === 0 ? 1 : progress.size)
  }

  _renderUpdateAllButton = () => {
    const { loading } = this.state
    const { repos } = this.props

    return (
      <div style={{ display: 'inline-block'}}>
        <Button
          icon="cloud-download"
          disabled={repos.length === 0}
          onClick={() => {
            this.setState({ loading: true })
            repos.forEach(repo => this._fetch(repo))
          }}
          loading={loading}
        >
          Update All
        </Button>
        <Progress
          style={{ lineHeight: 0.7, display: 'block'}}
          percent={this._getAllProgress()}
          showInfo={false}
          strokeWidth={5}
        />
      </div>
    )
  }

  _renderRepoTags = () => {
    const { progress, visible } = this.state
    const { repos } = this.props

    return (
      repos.map(repo => (
        <div key={"section-tag" + repo} style={{ display: 'inline-block'}}>
          <Progress
            type="circle"
            percent={progress.get(repo)}
            showInfo={false}
            strokeWidth={20}
            width={20}
          />
          <Tag
            className="repo-tag"
            checked={visible.get(repo)}
            onChange={checked => {
              visible.set(repo, checked)
              this.setState({ visible })
            }}
          >
            {repo}
          </Tag>
        </div>
      ))
    )
  }

  _renderBody = () => {
    const { data, stats, ready } = this.state
    const { type, repos } = this.props

    let body = <div />

    switch (type) {
      case TYPES.STAR:
        body = <Star repos={repos} data={data} stats={stats} ready={ready}/>
        break
      default:
        console.log('TYPE DOESNOT EXIST')
    }

    return body
  }

  render() {
    return (
      <div id="github-star-section">
        <Row type="flex" align="middle">
          <Col span={8}>
            <Card bordered={false}>
              <Icon type="star" style={{ fontSize: '32px', color: '#ffb900' }} />
            </Card>
          </Col>
          <Col span={8}>
            <Card bordered={false}>
              <div className="section-title">
                Star
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card bordered={false}>
              {this._renderUpdateAllButton()}
            </Card>
          </Col>
        </Row>
        <Row>
          {this._renderRepoTags()}
        </Row>
        {this._renderBody()}
      </div>
    )
  }

}

DataSection.propTypes = {
  githubApiToken: PropTypes.string,
  repos: PropTypes.array,
  deleteRepo: PropTypes.string,
  type: PropTypes.string,
}

const mapStateToProps = state => ({
  githubApiToken: state.github.githubApiToken
})

export default connect(
  mapStateToProps,
)(DataSection)