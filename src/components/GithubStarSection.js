import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import _ from 'lodash'

import { Card, Progress, Button, Row, Col, Icon } from 'antd'
import GithubFetcher from '../scripts/GithubFetcher'

class GithubStarSection extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      progress: new Map(),
      data: new Map(),
    }

    const { githubApiToken } = this.props
    this.fetcher = new GithubFetcher(githubApiToken)
  }

  static getDerivedStateFromProps(props, state) {
    state.progress.delete(props.deleteNmae)
    return state
  }

  /**
   * TODO
   * fetching for a specific repository
   */
  _fetch = (name) => {
    console.log(name)
    this.fetcher.fetchStargazerData(
      // onUpdate
      data => {},
      // onFinish
      stats => {},
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
    return (
      <div style={{ display: 'inline-block'}}>
        <Button icon="cloud-download">
          Update All
        </Button>
      </div>
    )
  }

  _renderRepoTagButton = (name,index) => {
    const { progress } = this.state
    return (
      <div style={{ display: 'inline-block'}}>
        <Button onClick={e=>this._fetch(name)}>
          {name}
        </Button>
        <Progress
          style={{ lineHeight: 0.7, display: 'block'}}
          percent={progress.get(name)}
          showInfo={false}
          strokeWidth={5}
        />
        <Button onClick={e=>this.props.deleteGithub(index)}>
          删除
        </Button>
      </div>

    )
  }


  render() {
    const { ready } = this.state
    const { repos } = this.props
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
          {repos.map((name ,index)=> (
            this._renderRepoTagButton(name,index)
          ))}
        </Row>
        {ready}
      </div>
    )
  }

}

GithubStarSection.propTypes = {
  githubApiToken: PropTypes.string,
  repos: PropTypes.array
}

const mapStateToProps = state => ({
  githubApiToken: state.github.githubApiToken
})

export default connect(
  mapStateToProps,
)(GithubStarSection)