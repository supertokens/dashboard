/* Copyright (c) 2022, VRAI Labs and/or its affiliates. All rights reserved.
 *
 * This software is licensed under the Apache License, Version 2.0 (the
 * "License") as published by the Apache Software Foundation.
 *
 * You may not use this file except in compliance with the License. You may
 * obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */
import React, { useState } from 'react'
import { StorageKeys, UNAUTHORISED_STATUS } from '../../../constants'
import { localStorageHandler } from '../../../services/storage'
import { fetchData, getApiUrl, getImageUrl } from '../../../utils'
import { Footer, LOGO_ICON_LIGHT } from '../footer/footer'
import InputField from '../inputField/InputField'

import './Auth.scss'

const Auth: React.FC<{
  onSuccess: () => void
}> = (props) => {
  const [apiKey, setApiKey] = useState('')
  const [apiKeyFieldError, setApiKeyFieldError] = useState('')
  const [loading, setIsLoading] = useState<boolean>(false)

  const validateKey = async () => {
    setIsLoading(true)
    const response = await fetchData({
      url: getApiUrl('/api/key/validate'),
      method: 'POST',
      config: {
        headers: {
          authorization: `Bearer ${apiKey}`,
        },
      },
    })

    const body = await response.json()

    if (response.status === 200 && body.status === 'OK') {
      localStorageHandler.setItem(StorageKeys.API_KEY, apiKey)
      props.onSuccess()
    } else if (response.status === UNAUTHORISED_STATUS) {
      setApiKeyFieldError('Invalid API Key')
    } else {
      setApiKeyFieldError('Something went wrong')
    }

    setIsLoading(false)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (apiKey !== null && apiKey !== undefined && apiKey.length > 0) {
      validateKey()
    } else {
      setApiKeyFieldError('API Key field cannot be empty')
    }
  }

  const handleApiKeyFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    setApiKey(value)
    setApiKeyFieldError('')
  }
  const backgroundUrlVars = {
    '--auth-background': `url("${getImageUrl('auth-background.png')}")`,
    '--auth-background-portrait': `url("${getImageUrl('auth-background-portrait.png')}")`,
  } as React.CSSProperties

  return (
    <>
      <div className='page-container auth-container' style={backgroundUrlVars}>
        <div className='block-container block-large'>
          <img className='title-image-smaller' src={LOGO_ICON_LIGHT} alt='Auth Page' />
          <h2 className='api-key-form-title text-title'>Enter your API Key</h2>
          <p className='text-small text-label'>Please enter the API key that you used to connect with your backend</p>
          <form className='api-key-form' onSubmit={handleSubmit}>
            <InputField
              handleChange={handleApiKeyFieldChange}
              name='apiKey'
              type='text'
              error={apiKeyFieldError}
              value={apiKey}
              placeholder='Your API Key'
            />

            <button className='button' type='submit' disabled={loading}>
              <span>Continue</span> <img src={getImageUrl('right_arrow_icon.svg')} alt='Auth Page' />
            </button>
          </form>
        </div>
      </div>
      <Footer horizontalAlignment='center' size='normal' verticalAlignment='center' colorMode='dark'></Footer>
    </>
  )
}

export default Auth
