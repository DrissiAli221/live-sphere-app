import { Container, Heading } from '@chakra-ui/react'
import React from 'react'

function Home() {
  return (
    <Container maxW={'container.xl'}>
        <Heading size='2xl' fontSize='md' textTransform={'uppercase'}>
            Trending
        </Heading>
    </Container>
  )
}

export default Home
