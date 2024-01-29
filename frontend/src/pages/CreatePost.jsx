import { TextInput, Select, FileInput, Button, Alert } from 'flowbite-react'
import { useState } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage'
import { app } from '../firebase'
import { CircularProgressbar } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import { useNavigate } from 'react-router-dom'

function CreatePost() {
  const [file, setFile] = useState(null)
  const [imageFileUploadedProgess, setImageFileUploadedProgess] = useState(null)
  const [imageFileUploadedError, setImageFileUploadedError] = useState(null)
  const [formData, setFormData] = useState({})
  const [publishError, setPublishError] = useState(null)
  const navigate = useNavigate()

  const handleUploadImage = async () => {
    try {
      if (!file) {
        setImageFileUploadedError('Please select an image')
        return
      }

      setImageFileUploadedError(null)
      const storage = getStorage(app)
      const filename = new Date().getTime() + file.name
      const storageRef = ref(storage, filename)
      const uploadTask = uploadBytesResumable(storageRef, file)

      uploadTask.on('state_changed',
        (snapshot) => {
          const progess = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          setImageFileUploadedProgess(progess.toFixed(0))
        },
        (error) => {
          setImageFileUploadedError('Could not upload image (File must be image type and less than 2Mb)')
          setImageFileUploadedProgess(null)
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadUrl) => {
            setImageFileUploadedProgess(null)
            setImageFileUploadedError(null)
            setFormData({ ...formData, image: downloadUrl })
          })
        }
      )
    } catch (error) {
      setImageFileUploadedError('Image upload fail')
      setImageFileUploadedProgess(null)
      console.log(error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const res = await fetch('http://localhost:8000/api/v1/posts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (!res.ok) {
        setPublishError(data.message)
        return
      }

      if (data.success === false) {
        setPublishError(data.message)
        return
      }

      setPublishError(null)
      navigate(`/post/${data.post.slug}`)
    } catch (error) {
      setPublishError('Something went wrong')
    }
  }

  return (
    <div className='p-3 max-w-3xl mx-auto min-h-screen'>
      <h1 className='text-center text-3xl my-7 font-semibold'>Create a post</h1>
      <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
        <div className='flex flex-col gap-4 sm:flex-row justify-between'>
          <TextInput
            type='text'
            placeholder='Title'
            required
            id='title'
            className='flex-1'
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          <Select onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
            <option value='uncategorized'>Select a category</option>
            <option value='javascript'>Javascript</option>
            <option value='reactjs'>React.js</option>
            <option value='nextjs'>Next.js</option>
          </Select>
        </div>
        <div className='flex gap-4 items-center justify-between border-4 border-teal-500 border-dotted p-3'>
          <FileInput
            type='file'
            accept='image/*'
            onChange={(e) => setFile(e.target.files[0])}
          />
          <Button
            type='button'
            gradientDuoTone='purpleToBlue'
            size='sm'
            outline
            onClick={handleUploadImage}
            disabled={imageFileUploadedProgess}
          >
            {
              imageFileUploadedProgess ?
                <div className='w-16 h-16'>
                  <CircularProgressbar value={imageFileUploadedProgess} text={`${imageFileUploadedProgess || 0}%`} />
                </div>
                : 'Upload image'
            }
          </Button>
        </div>
        {imageFileUploadedError && <Alert color='failure'>{imageFileUploadedError}</Alert>}
        {formData.image && <img src={formData.image} alt='upload' className='w-full h-72 object-cover' />}
        <ReactQuill
          theme='snow'
          placeholder='Write something...'
          className='h-72 mb-12'
          required
          onChange={(value) => setFormData({ ...formData, content: value })}
        />
        <Button type='submit' gradientDuoTone='purpleToPink'>Publish</Button>
        {
          publishError && <Alert className='mt-5' color='failure'>{publishError}</Alert>
        }
      </form>
    </div>
  )
}

export default CreatePost