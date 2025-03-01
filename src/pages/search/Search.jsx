import { Container, Heading } from '@chakra-ui/react'
import React from 'react'

function Search() {
  return (
<Container maxW={'container.xl'}>
        <Heading size='2xl' fontSize='md' textTransform={'uppercase'}>
            Search
        </Heading>
    </Container>
  )
}

export default Search
