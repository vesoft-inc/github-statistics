import React from 'react'
import PropTypes from 'prop-types'

import moment from 'moment'

import { Row, Statistic, Icon, Tag, Table } from 'antd'

import COLORS from './Colors'

class Release extends React.Component {

  _render = () => {
    const { stats, data, ready } = this.props

    return (
      <>
      {Array.from(ready.entries()).map((
        (pair, index) => {
          if (pair[1]) { // ready
            const { totalAssets, name, tagName, createdAt, totalDownloads } = stats.get(pair[0])

            const dateSinceCreated = Math.floor((Date.now() - new Date(createdAt).valueOf()) / (24*60*60*1000))
            const averageDownloadsPerDay = totalDownloads / dateSinceCreated

            return (
              <div key={`release-${pair[0]}`}>
                <Row>
                  <Tag color={COLORS[index]}>
                    {pair[0]}
                  </Tag>
                </Row>
                <Row type="flex" align="middle" justify="space-between">
                  <span className="stats-card">
                    <Statistic title="Release tag" value={tagName} />
                  </span>
                  <span className="stats-card">
                    <Statistic title="Release name" value={name} />
                  </span>
                  <span className="stats-card">
                    <Statistic title="Total assets" value={totalAssets} />
                  </span>
                  <span className="stats-card">
                    <Statistic title="Total asset downlaods" value={totalDownloads} prefix={<Icon type="download"/>} />
                  </span>
                  <span className="stats-card">
                    <Statistic title="Avg. downloads/day" value={averageDownloadsPerDay} precision={2} />
                  </span>
                </Row>
                <Row>
                  <Table columns={columns} dataSource={data.get(pair[0])} pagination={false}/>
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

const columns = [
  {
    title: 'Asset',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Content type',
    dataIndex: 'contentType',
    key: 'contentType',
  },
  {
    title: 'Downloads',
    dataIndex: 'downloadCount',
    key: 'downloadCount',
  },
  {
    title: 'Created at',
    dataIndex: 'createdAt',
    key: 'createdAt',
    render: time => moment(time).format("MMMM Do YYYY, h:mm:ss a")
  },
  {
    title: 'Updated at',
    dataIndex: 'updatedAt',
    key: 'updatedAt',
    render: time => moment(time).format("MMMM Do YYYY, h:mm:ss a")
  },

]


Release.propTypes = {
  id: PropTypes.string,
  repos: PropTypes.array,
  data: PropTypes.objectOf(Map),
  stats: PropTypes.objectOf(Map),
  ready: PropTypes.objectOf(Map),
}


export default Release