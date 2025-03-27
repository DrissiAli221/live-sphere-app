import { Container, Heading, Input, SimpleGrid } from "@chakra-ui/react";
import { searchAll } from "@/services/api";
import { useState } from "react";
import ContentGrid from "@/components/ContentGrid";

function Search() {
  const [activePage, setActivePage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    searchAll(searchValue, activePage)
      .then((res) => {
        setSearchResults(res);
        setActivePage(res.page);
        console.log(res);
      })
      .catch((error) => console.log(error))
      .finally(() => setLoading(false));
  };

  console.log(searchResults);

  return (
    <Container maxW={"container.xl"}>
      <Heading size="2xl" fontSize="md" textTransform={"uppercase"}>
        Search
      </Heading>
      <form onSubmit={handleSearch}>
        <Input
          placeholder="Search movies, tv shows, people..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          disabled={loading} // Prevents input changes while loading
        />
      </form>

      {/* Display search results */}
      <SimpleGrid columns={[1,2,3,4]} spacing={4} gap={4} px={4} py={4}>
      {searchResults.results &&
        !loading &&
        searchResults.results.slice(0,8).map((result, index) => (
          <ContentGrid
            item={result}
            index={index}
            contentType={result.media_type}
            key={result.id}
            content={result}
          />
        ))}
        </SimpleGrid>
    </Container>
  );
}

export default Search;
