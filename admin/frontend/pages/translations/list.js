import React from 'react'
import moment from 'moment'
import PageComponent from '~base/page-component'
import api from '~base/api'
import { Redirect } from 'react-router-dom'
import SuperTreeview from 'react-super-treeview'
import LabelForm from './form'
import 'react-super-treeview/dist/style.scss'
import { loggedIn } from '~base/middlewares/'
import { BaseTable } from '~base/components/base-table'
import BaseModal from '~base/components/base-modal'
import { error, success } from '~base/components/toast'
import ConfirmButton from '~base/components/confirm-button'

const modules = [
  { id: 'general', name: 'General' },
  { id: 'orders', name: 'Órdenes' }
]

class Translations extends PageComponent {
  constructor (props) {
    super(props)

    this.state = {
      labels: [],
      classNameModal: '',
      lang: null,
      module: null,
      currentLabel: null,
      node: null,
      depth: null,
        data: [
            {
                id: 'es-MX',
                name: 'es-MX',
                children: modules
            },
            {
                id: 'en-US',
                name: 'en-US',
                children: modules
            }
        ]
    }
  }

  async onPageEnter () {
    const data = await this.load()

    return data
  }

  async load () {
    var url = '/admin/dashboard/'
    const body = await api.get(url)

    return {
      orgsCount: body.orgsCount,
      usersCount: body.usersCount,
      rolesCount: body.rolesCount,
      groupsCount: body.groupsCount,
      todayIs: moment().format('DD - MMMM YYYY')
    }
  }

  getColumns () {
    return [
      {
        'title': 'Id',
        'property': 'id',
        'default': 'N/A'
      },
      {
        'title': 'Modulo',
        'property': 'module',
        'default': 'N/A'
      },
      {
        'title': 'Contenido',
        'property': 'content',
        'default': 'N/A'
      },
      {
        'title': 'Actions',
        formatter: (row) => {
          return (<div className='columns'>
            <div className='column'>
              <button className='button' onClick={() => this.setObject(row)}>
                <i className='fa fa-eye' />
              </button>
            </div>
            <div className='column'>
              <ConfirmButton
                title='Eliminar etiqueta'
                className='button is-danger'
                classNameButton='button is-danger'
                onConfirm={() => this.handleRemove(row)}
              >
                <i className='fa fa-trash-o' />
              </ConfirmButton>
            </div>
          </div>)
        }
      }
    ]
  }

  setNode (node, depth) {

    if (node.isExpanded) {
      this.setState({
        node,
        depth
      }, this.getLabels)
    }
  }

  async getLabels () {
    let { lang, node, depth } = this.state
    let url
    if (depth > 0) {
      url = `/admin/translations/${lang}/${node.id}`
      this.setState({
        module: node.id
      })
    } else {
      this.setState({
        lang: node.name
      })
      url = `/admin/translations/${node.name}`
    }

    const body = await api.get(url)

    this.setState({
      labels: body.data
    })
  }

  hideModal () {
    this.setState({
      classNameModal: false,
      currentLabel: null
    })
  }

  finish () {
    this.setState({
      classNameModal: false,
      currentLabel: null
    }, this.getLabels)
  }

  getModal () {
    let { currentLabel, lang, module } = this.state
    return (<BaseModal
      title={'Etiqueta'}
      className={'is-active'}
      hideModal={() => this.hideModal()}
    >
      <LabelForm initialState={currentLabel}
        lang={lang}
        module={module}
        finish={() => this.finish()}
        modules={modules}
        url='/admin/translations' />
    </BaseModal>)
  }

  setObject (row) {
    this.setState({
      currentLabel: row,
      classNameModal: true,
      module: row.module,
      lang: row.lang
    })
  }

  async handleBackup () {
    const body = await api.post( `/admin/translations/backup`)
    success()
  }

  async handleSynchronize () {
    const body = await api.post( `/admin/translations/synchronize`)
    success()
  }

  async handleRemove (row) {
    const body = await api.del( `/admin/translations/${row.uuid}`)
    success()
    this.getLabels()
  }

  render () {
    const { labels, lang, module } = this.state

    if (this.state.redirect) {
      return <Redirect to='/log-in' />
    }

    return (<div className='section'>
      <div className='columns controls message-body is-paddingless'>
        <div className='column has-text-right'>
          {
            lang && (<button
              className={'button'}
              onClick={() => this.setState({ classNameModal: true, currentLabel: null })}
            >
              <span className='icon'>
                <i className='fa fa-plus' />
              </span>
              <span>Nueva etiqueta</span>
            </button>)
          }

          <button
            className={'button'}
            onClick={e => this.handleBackup()}
          >
            <span className='icon'>
              <i className='fa fa-download' />
            </span>
            <span>Backup (db => json)</span>
          </button>
          <button
            className={'button'}
            onClick={e => this.handleSynchronize()}
          >
            <span className='icon'>
              <i className='fa fa-file' />
            </span>
            <span>Sync (json => db)</span>
          </button>
        </div>
      </div>

      <div className='columns'>
        <div className='column is-4'>
          <div className='card'>
            <div className='card-header'>
              <p className='card-header-title'>
                Translations
              </p>
            </div>
            <div className='card-content'>
              <SuperTreeview
                isDeletable={(node, depth) => { return false; }}
                isCheckable={(node, depth) => {
                  return false
                }}
                onExpandToggleCb={(node, depth) => {
                  this.setNode(node, depth)
                }}
                noChildrenAvailableMessage='***'
                data={this.state.data}
                onUpdateCb={(updatedData) => {
                  this.setState({ data: updatedData })
                }} />
            </div>
          </div>
        </div>
        <div className='column'>
          <div className='card'>
            <div className='card-content'>
              <BaseTable
                handleSort={(e) => this.handleSort(e)}
                data={labels}
                columns={this.getColumns()}
                sortAscending={this.state.sortAscending}
                sortBy={this.state.sort} />
            </div>
          </div>
        </div>
      </div>
      {
        this.state.classNameModal && this.getModal()
      }
    </div>)
  }
}

Translations.config({
  path: '/devtools/translations',
  exact: true,
  title: 'Translations',
  icon: 'list',
  validate: loggedIn
})

export default Translations
