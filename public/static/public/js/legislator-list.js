import _ from 'lodash'
import React from 'react'


function ChamberButtons(props) {
    if (Object.keys(props.chambers).length > 1) {
        return (
            <div className="button-group">
              <button type="button" onClick={() => props.setChamber('upper')} className={`button ${props.chamber === 'upper' ? 'button--active' : ''}`}>{props.chambers.upper}</button>
              <button type="button" onClick={() => props.setChamber('lower')} className={`button ${props.chamber === 'lower' ? 'button--active' : ''}`}>{props.chambers.lower}</button>
              <button type="button" onClick={() => props.setChamber(null)} className={`button ${props.chamber === null ? 'button--active' : ''}`}>Both Chambers</button>
          </div>
        );
    } else {
        return '';
    }
}


export default class LegislatorList extends React.Component {
  constructor (props) {
    super(props)
    const queryParams = new URLSearchParams(window.location.search)
    this.state = {
      order: 'asc',
      orderBy: 'name',
      chamber: queryParams.get('chamber') || null,
    }

    this.setChamber = this.setChamber.bind(this);
  }

  setSortOrder (field) {
    this.setState({
      order: (
        this.state.orderBy !== field
          ? 'asc'
          : this.state.order === 'asc' ? 'desc' : 'asc'
      ),
      orderBy: field
    })
  }

  setChamber (chamber) {
    this.setState({chamber})

    const queryParams = new URLSearchParams(window.location.search)
    if (chamber) {
      queryParams.set('chamber', chamber)
    } else {
      queryParams.delete('chamber')
    }
    const relativePath = queryParams.toString()
      ? `${window.location.pathname}?${queryParams.toString()}`
      : window.location.pathname
    history.pushState(null, '', relativePath)
  }

  render () {
    return (
      <div>
        <ChamberButtons chambers={this.props.chambers} chamber={this.state.chamber} setChamber={this.setChamber} />
        <table>
          <thead>
            <tr>
              <th></th>
              <th onClick={() => this.setSortOrder('name')}>Name</th>
              <th onClick={() => this.setSortOrder('party')}>Party</th>
              <th onClick={() => this.setSortOrder('district')}>District</th>
              <th onClick={() => this.setSortOrder('chamber')}>Chamber</th>
            </tr>
          </thead>
          <tbody>
            {_.orderBy(this.props.legislators, [this.state.orderBy], [this.state.order])
              .filter(legislator => this.state.chamber === null || legislator.chamber === this.state.chamber)
              .map(b =>
                <tr key={b.id}>
                  <td>
                      <img class="thumbnail mr1" src={b.image_url} alt={`headshot for ${b.name}`} />
                  </td>
                  <td><a href={b.pretty_url}>{b.name}</a></td>
                  <td>{b.current_role.party}</td>
                  <td>{b.current_role.district}</td>
                  <td>{b.current_role.chamber}</td>
                </tr>
              )
            }
          </tbody>
        </table>
      </div>
    )
  }
}
