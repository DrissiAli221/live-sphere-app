import { fetchTrending } from '../services/api'
import { Container, Grid, Heading, Flex, Box, Skeleton} from '@chakra-ui/react'
import { useEffect , useState} from 'react'
import React from 'react'
import CardImg from '@/components/CardImg'
import { SegmentedControl } from '@/components/ui/segmented-control'

function Home() {

    const [data , setData] = useState([]);
    const [loading , setLoading] = useState(true);
    const [timeWindow , setTimeWindow] = useState('day');

    useEffect(() => {
        fetchTrending(timeWindow)
            .then((res) => setData(res))
            .catch((err) => console.log(err))
            .finally(() => setLoading(false))
    }, [timeWindow])

    console.log(data)

  return (


    <Container maxW={'container.xl'}>
        <Flex alignItems={'baseline'} my={'10'} gap={'4'}>

        <Heading size='2xl' fontSize='md' textTransform={'uppercase'}>
            Trending
        </Heading>

            <Flex alignItems={'center'} gap={'2'} border={"1px solid #F00"} borderRadius={'15px'} >
                    {/* <Box 
                        as={'button'} 
                        px={'3'} py={'1'} 
                        borderRadius={'15px'}
                        onClick={() => setTimeWindow('day')}
                        bg={timeWindow === 'day' ? 'red.500' : 'transparent'}
                        cursor={'pointer'}
                        >Daily</Box>

                    <Box 
                    as={'button'} 
                    px={'3'} 
                    py={'1'} 
                    borderRadius={'15px'}
                    bg={timeWindow === 'week' ? 'red.500' : 'transparent'}
                    cursor={'pointer'}
                    onClick={() => setTimeWindow('week')}
                    >Weekly</Box> */}

                    <SegmentedControl
                    size="md"
                    defaultValue={timeWindow === 'day' ? "Daily" : "Weekly"}
                    items={["Daily", "Weekly"]}
                    onChange={(value) => setTimeWindow(value)}
                    />

            </Flex>

        </Flex>


        <Grid templateColumns={{
            base: '1fr',
            sm : 'repeat(2, 1fr)',
            md : 'repeat(4 , 1fr)',
            lg : 'repeat(5 , 1fr)',
        }} gap={5} py={4} 
        >
            {data && data.map((item , index ) => (
                loading? <Skeleton key={index} height={'540px'} borderRadius={'10px'}/>
                : <CardImg key={item.id} item={item} type={item.media_type} />
            ))}
        </Grid>

    </Container>
  )
}

export default Home
