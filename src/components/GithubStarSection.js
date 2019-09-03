import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
// import _ from 'lodash'

import { Card, Progress, Button, Row, Col, Icon } from 'antd'
import GithubFetcher from '../scripts/GithubFetcher'

class GithubStarSection extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      progress: new Map(),
      data: new Map(),
      init: true, // indicate wether this is initially rendered
    }

    const { githubApiToken } = this.props
    this.fetcher = new GithubFetcher(githubApiToken)
  }

  // componentDidUpdate(prevProps) {
  //   const { deleteRepo } = this.props
  //   const { data, progress } = this.state
  //   if (deleteRepo === prevProps.deleteRepo && deleteRepo !== '') {
  //     data.delete(deleteRepo)
  //     progress.delete(deleteRepo)
  //     this.setState({ data, progress })
  //   }
  // }

  /**
   * TODO
   * fetching for a specific repository
   */
  _fetch = name => {
    this.fetcher.fetchStargazerData(
      // onUpdate
      data => {
        this.state.data.set(name, data)
      },
      // onFinish
      stats => {
        this.state.data.set(name, stats)
      },
      // onProgres
      progress => {
        this.state.progress.set(name,progress)
        this.setState({
          progress:this.state.progress
        })
      }

    )
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

  _renderRepoTagButton = name => {
    const { progress } = this.state
    return (
      <div id="name" style={{ display: 'inline-block'}}>
        <Button onClick={() =>this._fetch(name)}>
          {name}
        </Button>
        <Progress
          style={{ lineHeight: 0.7, display: 'block'}}
          percent={progress.get(name)}
          showInfo={false}
          strokeWidth={5}
        />
      </div>

    )
  }


  render() {
    const { ready } = this.state
    const { repos } = this.props

    console.log(repos)

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
          {repos.map(name => (
            this._renderRepoTagButton(name)
          ))}
        </Row>
        {ready}
      </div>
    )
  }

}

GithubStarSection.propTypes = {
  githubApiToken: PropTypes.string,
  repos: PropTypes.array,
  deleteRepo: PropTypes.string,
}

const mapStateToProps = state => ({
  githubApiToken: state.github.githubApiToken
})

export default connect(
  mapStateToProps,
)(GithubStarSection)