import { Box, Container, Flex } from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import React from 'react'

const Navbar = () => {
  return (
    <Box>
        <Container maxW={'container.xl'}>
            <Flex justifyContent={'space-between'} py={4}>
                <Link to='/' >
                    <Box 
                        fontSize={24}
                        fontWeight={'bold'}
                        color={'red'}
                        letterSpacing={'widest'}
                        fontFamily={'monospace'}
                    >
                        Live Sphere
                    </Box>
                </Link>

                {/* Desktop Navbar */}

                <Flex>
                    <Link to='/'>Home</Link>
                    <Link to='/movies'>Movies</Link>
                    <Link to='/shows'>TV Shows</Link>
                    <Link to='/search'>Search</Link>
                </Flex>
            </Flex>
        </Container>
    </Box>
  )
}

export default Navbar
