import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
// import _ from 'lodash'

import TYPES from './DataTypes'

import { Card, Progress, Button, Row, Col, Icon, Tag } from 'antd'
import GithubFetcher from '../scripts/GithubFetcher'

class DataSection extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      progress: new Map(),
      data: new Map(),
      visible: new Map(),
      loading: false,
      ready: false,
    }

    const { githubApiToken } = this.props
    this.fetcher = new GithubFetcher(githubApiToken)
  }

  componentDidUpdate(prevProps) {
    const { deleteRepo, repos } = this.props
    const { data, progress, visible } = this.state

    // delete repo out
    if (deleteRepo !== prevProps.deleteRepo && deleteRepo !== '') {
      data.delete(deleteRepo)
      progress.delete(deleteRepo)
      this.setState({ data, progress })
    }

    // new repo in
    if (prevProps.repos !== repos && deleteRepo === '') {
      const newRepo = repos.filter(repo => !prevProps.repos.includes(repo))
      newRepo.forEach(repo => {
        visible.set(repo, true)
        progress.set(repo, 0)
        this.setState({ visible, progress })
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
    const { type } = this.props
    const slashIndex = repo.indexOf('/')
    const owner = repo.slice(0, slashIndex)
    const name = repo.slice(slashIndex + 1)
    const onUpdate = data => {
      this.state.data.set(repo, data)
    }
    const onFinish = stats => {
      this.state.data.set(repo, stats)
      if (this._getAllProgress() === 100) {
        this.setState({ loading: false })
      }
    }
    const onProgress = progress => {
      this.state.progress.set(repo,progress)
      this.setState({
        progress:this.state.progress
      })
    }

    switch (type) {
      case TYPES.STAR:
        this.fetcher.fetchStargazerData(
          owner, name,
          onUpdate,
          onFinish,
          onProgress
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

  _renderRepoTagButtons = () => {
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
          <Tag.CheckableTag
            className="repo-tag.checkable-tag"
            checked={visible.get(repo)}
            onChange={checked => {
              visible.set(repo, checked)
              this.setState({ visible })
            }}
          >
            {repo}
          </Tag.CheckableTag>
        </div>
      ))
    )
  }


  render() {
    const { ready } = this.state
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
                Star Trend _RE
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
          {this._renderRepoTagButtons()}
        </Row>
        {ready}
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