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
      init: true, // indicate wether this is initially rendered
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
   */
  _fetch = name => {
    const { type } = this.props
    const onUpdate = data => {
      this.state.data.set(name, data)
    }
    const onFinish = stats => {
      this.state.data.set(name, stats)
    }
    const onProgress = progress => {
      this.state.progress.set(name,progress)
      this.setState({
        progress:this.state.progress
      })
    }

    switch (type) {
      case TYPES.STAR:
        this.fetcher.fetchStargazerData(
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

  _renderUpdateAllButton = () => {
    const { progress, init } = this.state
    const { repos } = this.props

    const allProgress =
      Array.from(progress.values()).reduce((a, b) => a + b, 0)
      / (progress.size === 0 ? 1 : progress.size)

    // console.log(allProgress)
    const allLoading = allProgress !== 100

    return (
      <div style={{ display: 'inline-block'}}>
        <Button
          icon="cloud-download"
          disabled={repos.length === 0}
          onClick={() => {
            this.setState({ init: false })
            repos.forEach(name => this._fetch(name))
          }}
          loading={!init && allLoading}
        >
          Update All
        </Button>
        <Progress
          style={{ lineHeight: 0.7, display: 'block'}}
          percent={allProgress}
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