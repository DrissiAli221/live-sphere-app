import { fetchTrending } from '../services/api'
import { Container, Heading } from '@chakra-ui/react'
import { useEffect } from 'react'
import React from 'react'

function Home() {

    console.log("API Key:", import.meta.env.VITE_APP_API_KEY);

    useEffect(() => {
        fetchTrending('day')
            .then((res) => console.log(res))
            .catch((err) => console.log(err))
    }, [])

  return (
    <Container maxW={'container.xl'}>
        <Heading size='2xl' fontSize='md' textTransform={'uppercase'}>
            Trending
        </Heading>
    </Container>
  )
}

export default Home
