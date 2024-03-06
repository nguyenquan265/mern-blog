import { Label, TextInput, Button, Alert, Spinner } from 'flowbite-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import env from '../config/env'

function ForgotPassword() {
  const [email, setEmail] = useState()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState('')

  const handleChange = (e) => {
    setEmail(e.target.value.trim())
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setLoading(true)

      const res = await fetch(`${env.API_ROOT}/api/v1/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      if (res.ok) {
        setLoading(false)
      }

      const data = await res.json()
      setResult(data.message)
    } catch (error) {
      setLoading(false)
      setError(error.message)
      console.log(error)
    }
  }

  return (
    <div className='min-h-screen mt-20'>
      <div className='flex p-3 max-w-3xl mx-auto flex-col md:flex-row md:items-center gap-5'>
        {/* left */}
        <div className='flex-1'>
          <Link to='/' className='font-bold dark:text-white text-4xl'>
            <span className='px-2 py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg text-white'>Kendy's</span>
            Blog
          </Link>
          <p className='text-sm mt-5'>Forgot your password? Type your email, we will send you a reset password link.</p>
        </div>
        {/* right */}
        <div className='flex-1'>
          <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
            <div>
              <Label value='Your email' />
              <TextInput type='email' placeholder='abc@email.com' id='email' onChange={handleChange} required />
            </div>
            <Button gradientDuoTone='purpleToPink' type='submit' disabled={loading}>
              {
                loading ? (
                  <>
                    <Spinner size='sm' />
                    <span className='pl-3'>Loading...</span>
                  </>
                ) : 'Confirm email'
              }
            </Button>
          </form>
          <div className='flex gap-2 text-sm mt-5'>
            <span>Don't have an account?</span>
            <Link to='/sign-up' className='text-blue-500'>Sign Up</Link>
          </div>
          {
            error && (
              <Alert className='mt-5' color='failure'>
                {error}
              </Alert>
            )
          }
          {
            result && (
              <Alert className='mt-5' color='success'>
                {result}
              </Alert>
            )
          }
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword