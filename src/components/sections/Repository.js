import React from 'react'
import PropTypes from 'prop-types'

import moment from 'moment'

import { Row, Statistic, Icon, Tag } from 'antd'

import COLORS from './Colors'

class Repository extends React.Component {

  _render = () => {
    const { stats, ready } = this.props

    return (
      <>
      {Array.from(stats.entries()).map((
        (pair, index) => {
          if (ready.get(pair[0])) {
            const { name, createdAt, primaryLanguage, pushedAt, watcherCount } = pair[1]
            const dateSinceCreated = Math.floor((Date.now() - new Date(createdAt).valueOf()) / (24*60*60*1000))

            return (
              <div key={`repo-${pair[0]}`}>
                <Row>
                  <Tag color={COLORS[index]}>
                    {pair[0]}
                  </Tag>
                </Row>
                <Row type="flex" align="middle" justify="space-between">
                  <span className="stats-card">
                    <Statistic title="Repository" value={name} />
                  </span>
                  <span className="stats-card">
                    <Statistic title="Date created" value={new Date(createdAt).toDateString()} />                  </span>
                  <span className="stats-card">
                    <Statistic title="Days since created" value={dateSinceCreated} />
                  </span>
                  <span className="stats-card">
                    <Statistic title="Primary language" value={primaryLanguage} />
                  </span>
                  <span className="stats-card">
                    <Statistic title="Last push at" value={moment(pushedAt).fromNow()} />
                  </span>
                  <span className="stats-card">
                    <Statistic title="Watchers" prefix={<Icon type="eye"/>} value={watcherCount} />
                  </span>
                </Row>
              </div>
            )
          }
          return false
        }
      ))}
      </>
    )
  }

  render() {
    return (
      <>
      {this._render()}
      </>
    )
  }
}

Repository.propTypes = {
  id: PropTypes.string,
  repos: PropTypes.array,
  data: PropTypes.objectOf(Map),
  stats: PropTypes.objectOf(Map),
  ready: PropTypes.objectOf(Map),
}


export default Repository