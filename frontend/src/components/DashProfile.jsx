import { Alert, Button, Modal, TextInput } from 'flowbite-react'
import { useState, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage'
import { app } from '../firebase'
import { CircularProgressbar } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import {
  updateStart,
  updateSuccess,
  updateFailure,
  deleteStart,
  deleteSuccess,
  deleteFailure,
  signOutSuccess
} from '../redux/user/userSlice'
import { HiOutlineExclamationCircle } from 'react-icons/hi'
import { Link } from 'react-router-dom'

function DashProfile() {
  const { currentUser, error, loading } = useSelector(state => state.user)
  const [imageFile, setImageFile] = useState(null)
  const [imageFileUrl, setImageFileUrl] = useState(null)
  const [imageFileUploadedProgess, setImageFileUploadedProgess] = useState(null)
  const [imageFileUploadedError, setImageFileUploadedError] = useState(null)
  const [imageFileUploading, setImageFileUploading] = useState(false)
  const [updateUserSuccess, setUpdateUserSuccess] = useState(null)
  const [updateUserError, setUpdateUserError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({})
  const filePickerRef = useRef()
  const dispatch = useDispatch()

  const handleImageChange = (e) => {
    const file = e.target.files[0]

    if (file) {
      setImageFile(file)
    }
  }

  const uploadImage = async () => {
    setImageFileUploading(true)
    setImageFileUploadedError(null)
    const storage = getStorage(app)
    const filename = new Date().getTime() + imageFile.name
    const storageRef = ref(storage, filename)
    const uploadTask = uploadBytesResumable(storageRef, imageFile)

    uploadTask.on('state_changed',
      (snapshot) => {
        const progess = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        setImageFileUploadedProgess(progess.toFixed(0))
      },
      (error) => {
        setImageFileUploadedError('Could not upload image (File must be image type and less than 2Mb)')
        setImageFileUploadedProgess(null)
        setImageFile(null)
        setImageFileUrl(null)
        setImageFileUploading(false)
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadUrl) => {
          setImageFileUploading(false)
          setImageFileUrl(downloadUrl)
          setFormData({ ...formData, profilePicture: downloadUrl })
        })
      }
    )
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUpdateUserError(null)
    setUpdateUserSuccess(null)

    if (Object.keys(formData).length == 0) {
      setUpdateUserError('No changes made')
      return
    }

    try {
      dispatch(updateStart())

      const res = await fetch(`http://localhost:8000/api/v1/users/update/${currentUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      })

      const data = await res.json()
      console.log(data)

      if (!res.ok) {
        dispatch(updateFailure(data.message))
        setUpdateUserError(data.message)
      } else {
        dispatch(updateSuccess(data))
        setUpdateUserSuccess("User's profile updated successfully")
      }
    } catch (error) {
      dispatch(updateFailure(error.message))
      setUpdateUserError(data.message)
    }
  }

  const handleDeleteUser = async () => {
    setShowModal(false)

    try {
      dispatch(deleteStart())

      const res = await fetch(`http://localhost:8000/api/v1/users/delete/${currentUser._id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      const data = await res.json()

      if (!res.ok) {
        dispatch(deleteFailure(data.message))
      } else {
        dispatch(deleteSuccess(data))
      }
    } catch (error) {
      dispatch(deleteFailure(error.message))
    }
  }

  const handleSignOut = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/auth/signout`, {
        method: 'POST',
        credentials: 'include'
      })

      const data = await res.json()

      if (!res.ok) {
        console.log(data.message)
      } else {
        dispatch(signOutSuccess(data))
      }
    } catch (error) {
      console.log(error.message)
    }
  }

  useEffect(() => {
    if (imageFile) {
      uploadImage()
    }
  }, [imageFile])

  return (
    <div className='max-w-lg mx-auto p-3 w-full'>
      <h1 className='my-7 text-center font-semibold text-3xl'>profile</h1>
      <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
        <input type="file" accept='image/*' onChange={handleImageChange} ref={filePickerRef} hidden />
        <div
          className='relative w-32 h-32 self-center cursor-pointer shadow-md overflow-hidden rounded-full'
          onClick={() => filePickerRef.current.click()}
        >
          {imageFileUploadedProgess && (
            <CircularProgressbar
              value={imageFileUploadedProgess || 0}
              text={`${imageFileUploadedProgess}%`}
              strokeWidth={5}
              styles={{
                root: {
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                  top: 0,
                  left: 0
                },
                path: {
                  stroke: `rgba(62, 152, 199, ${imageFileUploadedProgess / 100})`
                }
              }}
            />
          )}
          <img
            src={imageFileUrl || currentUser.profilePicture} alt='user'
            className={`rounded-full w-full h-full object-cover border-8 border-[lightgray] ${imageFileUploadedProgess && imageFileUploadedProgess < 100 && 'opacity-60'}`}
          />
        </div>
        {imageFileUploadedError && <Alert color='failure'>{imageFileUploadedError}</Alert>}
        <TextInput
          type='text'
          id='username'
          placeholder='username'
          defaultValue={currentUser.username}
          onChange={handleChange}
        />
        <TextInput
          type='email'
          id='email'
          placeholder='email'
          defaultValue={currentUser.email}
          onChange={handleChange}
        />
        <TextInput
          type='password'
          id='currentPassword'
          placeholder='type your current password'
          disabled={currentUser.registrationMethod !== 'email'}
          onChange={handleChange}
        />
        <TextInput
          type='password'
          id='newPassword'
          placeholder='type your new password'
          disabled={currentUser.registrationMethod !== 'email'}
          onChange={handleChange}
        />
        <Button
          type='submit'
          gradientDuoTone='purpleToBlue'
          outline
          disabled={loading || imageFileUploading}
        >
          {loading ? 'Loading...' : 'Update'}
        </Button>
        {currentUser.isAdmin && (
          <Link to='/create-post'>
            <Button type='button' gradientDuoTone='purpleToPink' className='w-full'>Create a post</Button>
          </Link>
        )}
      </form>
      <div className='text-red-500 flex justify-between mt-5'>
        <span className='cursor-pointer' onClick={() => setShowModal(true)}>Delete Account</span>
        <span className='cursor-pointer' onClick={() => handleSignOut()}>Sign Out</span>
      </div>
      {updateUserSuccess && (
        <Alert color='success' className='mt-5'>{updateUserSuccess}</Alert>
      )}
      {updateUserError && (
        <Alert color='failure' className='mt-5'>{updateUserError}</Alert>
      )}
      {error && (
        <Alert color='failure' className='mt-5'>{error}</Alert>
      )}
      <Modal show={showModal} onClose={() => setShowModal(false)} popup size='md'>
        <Modal.Header />
        <Modal.Body>
          <div className='text-center'>
            <HiOutlineExclamationCircle className='h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto' />
            <h3 className='mb-5 text-lg text-gray-500 dark:text-gray-400'>Are you sure you want to delete your account?</h3>
            <div className='flex justify-center gap-4'>
              <Button color='failure' onClick={() => handleDeleteUser()}>Yes, i'm sure</Button>
              <Button color='gray' onClick={() => setShowModal(false)}>No, cancel</Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  )
}
``
export default DashProfile