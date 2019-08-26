import React from 'react'
import Button from '@material-ui/core/Button'
import { Tabs, Card, Spin, Icon } from 'antd'
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

import GithubRepoScript from '../scripts/GithubRepoScript'

const { TabPane } = Tabs

class GithubSection extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      ready: false,
      loading: false,
      starData: [],
    }
    this.GithubRepoScript = new GithubRepoScript()
  }

  _fetchGithubData = async () => {
    this.setState({ ready: false, loading: true })
    this.setState({ starData: await this.GithubRepoScript.fetchStargazerData(), ready: true, loading: false })
  }

  _refreshGithubData = async () => {
    this.setState({ loading: true })
    this.setState({ starData: await this.GithubRepoScript.fetchStargazerData(), loading: false })
  }

  _getStarIncrementData = () => {
    const formattedData = []
    this.state.starData.forEach((value, key) => {
      formattedData.push({
        date: key,
        stars: value,
      })
    })
    return formattedData
  }

  _getStarTotalData = () => {
    const formattedData = []
    let cumulativeStarCount = 0
    this.state.starData.forEach((value, key) => {
      cumulativeStarCount += value
      formattedData.push({
        date: key,
        stars: cumulativeStarCount,
      })
    })
    return formattedData
  }

  _renderGetButton = () => (
    <Spin
      spinning={this.state.loading}
      indicator={<Icon type="loading" style={{ fontSize: 24 }} spin />}
    >
      <Button variant="outlined" disabled={this.state.loading} color="primary" onClick={this._fetchGithubData} >
        Get github data
      </Button>
    </Spin>
  )
  _renderRefreshButton = () => (
    <Button color="primary" disabled={this.state.loading} onClick={this._refreshGithubData} size="small">
      Refresh
    </Button>
  )

  render() {
    // const dotStyle = {strokeWidth: 2, r: 2.5}

    return (
      <Card>
        {this.state.ready
          ?
          <Spin
            spinning={this.state.loading}
            indicator={<Icon type="loading" style={{ fontSize: 24 }} spin />}
          >
            <Tabs defaultActiveKey="1" tabBarStyle={{ borderWidth: 0 }} tabBarExtraContent={this._renderRefreshButton()}>
              <TabPane tab="Total stars" key="1">
                <ResponsiveContainer width="95%" height={300}>
                  <LineChart data={this._getStarTotalData()}>
                    <Line type="monotone" dataKey="stars" stroke="#8884d8" dot={false}/>
                    <CartesianGrid stroke="#ccc" strokeDasharray="2 7" />
                    <XAxis
                      dataKey="date"
                      domain = {['auto', 'auto']}
                      type="number"
                      tickFormatter={ms => new Date(ms).toISOString().slice(0,10)}
                    />
                    <YAxis />
                    <Tooltip
                      // formatter={(value, name) => [value, new Date(name).toISOString().slice(0,10)]}
                      labelFormatter={ms => new Date(ms).toISOString().slice(0,10)}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </TabPane>
              <TabPane tab="Increment of day" key="2">
                <ResponsiveContainer width="95%" height={300}>
                  <LineChart data={this._getStarIncrementData()}>
                    <Line type="monotone" dataKey="stars" stroke="#8884d8" dot={false}/>
                    <CartesianGrid stroke="#ccc" strokeDasharray="3 7" />
                    <XAxis
                      dataKey="date"
                      domain = {['auto', 'auto']}
                      type="number"
                      tickFormatter={ms => new Date(ms).toISOString().slice(0,10)}
                    />
                    <YAxis />
                    <Tooltip
                      // formatter={(value, name) => [value, new Date(name).toISOString().slice(0,10)]}
                      labelFormatter={ms => new Date(ms).toISOString().slice(0,10)}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </TabPane>
            </Tabs>
          </Spin>
          :
          this._renderGetButton()}
      </Card>
    )
  }
}

export default GithubSection