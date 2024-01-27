import { Alert, Button, TextInput } from 'flowbite-react'
import { useState, useRef, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage'
import { app } from '../firebase'
import { CircularProgressbar } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'

function DashProfile() {
  const { currentUser } = useSelector(state => state.user)
  const [imageFile, setImageFile] = useState(null)
  const [imageFileUrl, setImageFileUrl] = useState(null)
  const [imageFileUploadedProgess, setImageFileUploadedProgess] = useState(null)
  const [imageFileUploadedError, setImageFileUploadedError] = useState(null)
  const filePickerRef = useRef()

  const handleImageChange = (e) => {
    const file = e.target.files[0]

    if (file) {
      setImageFile(file)
    }
  }

  const uploadImge = async () => {
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
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadUrl) => {
          setImageFileUrl(downloadUrl)
        })
      }
    )
  }

  useEffect(() => {
    if (imageFile) {
      uploadImge()
    }
  }, [imageFile])

  return (
    <div className='max-w-lg mx-auto p-3 w-full'>
      <h1 className='my-7 text-center font-semibold text-3xl'>profile</h1>
      <form className='flex flex-col gap-4'>
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
        <TextInput type='text' id='username' placeholder='username' defaultValue={currentUser.username} />
        <TextInput type='email' id='email' placeholder='email' defaultValue={currentUser.email} />
        <TextInput type='password' id='currentPassword' placeholder='type your current password' disabled={currentUser.registrationMethod !== 'email'} />
        <TextInput type='password' id='newPassword' placeholder='type your new password' disabled={currentUser.registrationMethod !== 'email'} />
        <Button type='submit' gradientDuoTone='purpleToBlue' outline>Update</Button>
      </form>
      <div className='text-red-500 flex justify-between mt-5'>
        <span className='cursor-pointer'>Delete Account</span>
        <span className='cursor-pointer'>Sign Out</span>
      </div>
    </div>
  )
}
``
export default DashProfile