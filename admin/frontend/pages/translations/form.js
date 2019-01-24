import React, { Component } from 'react'
import MarbleForm from '~base/components/marble-form'
import api from '~base/api'

class TranslationForm extends Component {
    constructor(props) {
        super(props)

        const schema = {
            'id': {
                'label': 'id',
                'default': '',
                'id': 'id',
                'name': 'id',
                'widget': 'TextWidget',
                'required': true
            },
            'module': {
                'widget': 'SelectWidget',
                'name': 'module',
                'label': 'Modulo',
                'required': true,
                'allowEmpty': false,
                'options': []
            },
            'content': {
                'widget': 'TextareaWidget',
                'name': 'content',
                'label': 'Contenido',
                'required': true
            }
        }

        const initialState = this.props.initialState || {}

        const formData = {}
        formData.id = initialState.id || ''
        formData.module = initialState.module || ''
        formData.content = initialState.content || ''

        this.state = {
            formData,
            schema,
            errors: {}
        }
    }

    errorHandler(e) { }

    changeHandler(formData) {
        this.setState({
            formData
        })
    }

    async submitHandler(formData) {
        let { initialState } = this.props
        let url = this.props.url

        console.log('initialState', initialState)
        let method = 'post'
        if (initialState) {
            url = `${this.props.url}/${initialState.uuid}`
        }
        const res = await api[method](url, { ...formData, lang: this.props.lang})

        if (this.props.finish) {
            await this.props.finish()
        }

        return res.data
    }

    successHandler(data) {
        if (this.props.finishUp) { this.props.finishUp(data) }
    }

    render() {
        const { schema, formData} = this.state

        schema.module.options = this.props.modules.map(item => {
            return { label: item.name, value: item.id }
        })

        return (
            <div>
                <MarbleForm
                    schema={schema}
                    formData={formData}
                    buttonLabel={'Guardar'}
                    onChange={(data) => this.changeHandler(data)}
                    onSuccess={(data) => this.successHandler(data)}
                    onSubmit={(data) => this.submitHandler(data)}
                    defaultSuccessMessage={'Guardado correctamente'}
                    errors={this.state.errors}
                />
            </div>
        )
    }
}

export default TranslationForm
