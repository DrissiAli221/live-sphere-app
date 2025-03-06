import { baseImageW500 } from '@/services/api'
import { Link } from 'react-router-dom';
import { Box, Flex, Image, Text } from '@chakra-ui/react';
import { getLanguageName } from '@/services/details';

const CardImg = ({ item , type }) => {
  return (
    <Link to= {`/${type}/${item?.id}`}>
      {/* Background container */}
      <Box 
        bg="#1E0F2F" 
        border={'1px solid #C49A6C'}
        overflow="hidden"
        my={'3'}
        height={'100%'}
        _hover={{ transform: { base : "scale(1)", md : "scale(1.03)"}, transition: "transform 0.3s ease-in-out" }}
      >    

            {/* Image container */}
            <Box position="relative" overflow="hidden">
            <Image 
                src={`${baseImageW500}/${item.poster_path}`} 
                alt={item?.title || item?.name} 
                width="100%"
                height="100%"
                objectFit="cover"
            />
            </Box>

        {/* Movie Info */}
        <Box mt="1.5" px={3} >
                {/* // Genre */}
                <Text fontSize="sm" color="gray.400" mb={'1.5'}>Action, Adventure, Fantasy</Text>
                {/* // Rating */}
                <Text 
                    fontSize="md"
                    bg="yellow.500"
                    color="black"
                    borderRadius={'5px'}
                    width={'fit-content'}
                    px={'2'}
                    py={'1'}
                    mb={'1.5'}
                    >
                        IMDb {item.vote_average?.toFixed(1)}</Text>

                {/* // Title */}
                <Text 
                    fontSize="1.25rem" 
                    color="white" 
                    mb={'2'}
                    fontWeight={'bold'}

                >
                    {item?.title || item?.name}</Text>

                {/* // Release Date  + Language */}
                <Flex gap={'1'}>
                    <Text 
                        fontSize="sm" 
                        color="white"
                        border={'1px solid #C49A6C'}
                        borderRadius={'15px'}
                        width={'fit-content'}
                        px={'2'}
                        textAlign={'center'}
                        pt={'2px'} pb={'2px'}
                    >
                        {new Date(item?.release_date || item?.first_air_date).getFullYear() | "N/A"}
                    </Text>

                    <Text
                        fontSize="sm"
                        color="white"
                        borderRadius={'15px'}
                        border={'1px solid #C49A6C'}
                        width={'fit-content'}
                        px={'3'}
                        ml={'2'}
                        pt={'2px'} pb={'2px'}
                    >
                        {getLanguageName(item?.original_language)}
                    </Text>

                </Flex>
        </Box>
      </Box>
    </Link>
  );
};

export default CardImg;