import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
// import _ from 'lodash'

import TYPES from './DataTypes'
import '../css/DataSection.css'

import { Progress, Button, Row, Icon, Tag, Popover } from 'antd'
import GithubFetcher from '../scripts/GithubFetcher'

import Repository from './sections/Repository'
import Star from './sections/Star'
import Fork from './sections/Fork'
import Commit from './sections/Commit'
import Release from './sections/Release'

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

    const { githubApiToken, type } = this.props

    this.fetcher = new GithubFetcher(githubApiToken)

    switch (type) {
      case TYPES.REPO:
        this.icon = <Icon type="book" style={{ fontSize: '24px', color: '#333333' }} />
        this.body = Repository
        this.fetchCall = this.fetcher.fetchRepositoryData
        break
      case TYPES.STAR:
        this.info = 'Star trend data are huge, they might take minutes to load.'
        this.icon = <Icon type="star" style={{ fontSize: '24px', color: '#ffb900' }} />
        this.body = Star
        this.fetchCall = this.fetcher.fetchStargazerData
        break
      case TYPES.FORK:
        this.icon = <Icon type="fork" style={{ fontSize: '24px', color: '#333333' }} />
        this.body = Fork
        this.fetchCall = this.fetcher.fetchForkData
        break
      case TYPES.COMMIT:
        this.info = 'Because of the API restriction, only commits in a recent year will be loaded.'
        this.icon = <Icon type="history" style={{ fontSize: '24px', color: '#333333' }} />
        this.body = Commit
        this.fetchCall = this.fetcher.fetchCommitData
        break
      case TYPES.RELEASE:
        this.icon = <Icon type="tag" style={{ fontSize: '24px', color: '#333333' }} />
        this.body = Release
        this.fetchCall = this.fetcher.fetchReleaseData
        break
      default:
        console.log('TYPE DOESNOT EXIST')
        return 'ERROR'
    }

    // data formatter
    this.formatter = this.body.formatter
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
    const { repos } = this.props
    const slashIndex = repo.indexOf('/')
    const owner = repo.slice(0, slashIndex)
    const name = repo.slice(slashIndex + 1)

    const onUpdate = data => {
      if(this.state.data.has(repo)) {
        this.state.data.set(
          repo,
          this.formatter ? this.formatter(repo, data) : data,
        )
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

    this.fetchCall(
      owner, name,
      onUpdate,
      onFinish,
      onProgress,
      shouldAbort,
    )

    return 'FETCH REQUESTED'
  }

  /**
   * get progress of fetching all
   * @returns progress as number from 0 to 100
   */
  _getAllProgress = () => {
    const { progress } = this.state
    return Math.floor(Array.from(progress.values()).reduce((a, b) => a + b, 0)
    / (progress.size === 0 ? 1 : progress.size))
  }

  _renderUpdateAllButton = () => {
    const { loading, ready } = this.state
    const { repos } = this.props

    return (
      <Button
        icon="cloud-download"
        type="link"
        disabled={repos.length === 0}
        onClick={() => {
          this.setState({ loading: true })
          if (this._getAllProgress() === 100) { // re-fetch all
            repos.forEach(repo => this._fetch(repo))
          }
          else { // on fetch unfetched
            repos.forEach(repo => {
              if (!ready.get(repo)) {
                this._fetch(repo)
              }
            })
          }
        }}
        loading={loading}
      >
        update
      </Button>
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
            strokeWidth={8}
            width={16}
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
    const { data, stats, ready, loading } = this.state
    const { repos } = this.props

    return <this.body repos={repos} data={data} stats={stats} ready={ready} loading={loading}/>
  }

  render() {
    const { type } = this.props

    return (
      <div id={type}>
        <Row type="flex" align="middle" className="section-header">
          <div className="data-card">
            {this.icon}
            <div className="section-title">
              {type}
            </div>
            {this.info ?
              <Popover className="info-tag" content={this.info} placement="left">
                <Icon type="info-circle" />
              </Popover> : null }
          </div>
          <div className="data-card"  style={{ marginLeft: 'auto' }}>
            {this._renderRepoTags()}
          </div>
          <Progress
            type="circle"
            strokeWidth={4}
            width={32}
            percent={this._getAllProgress()}
          />
          <div className="data-card">
            {this._renderUpdateAllButton()}
          </div>
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