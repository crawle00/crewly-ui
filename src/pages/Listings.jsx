import {Card, Box, Title, Text, Button} from "@mantine/core";
import {useParams , useNavigate} from "../router";

//Hard code just to simulate listing being pulled.
const fakeListings = [
    {
        id: 1,
        title: "IT Help",
        publisher: "CS Club",
        description: "Install Steam onto PCs",
        location: "University of Arkansas-Fort Smith | Baldor 143",
        date: "09/02/2026 | 2:00 PM"
    },

]

function Listings(){ 
    const navigate = useNavigate();
    const {id} = useParams();
    const listing = fakeListings[0];
    //const listing = fakeListings.find((job) => job.id === Number(id));
    

    return(
        <main>
                <Button
                    variant = "subtle"
                    onClick = {() => navigate("/")}
                >
                    Back to Listings
                </Button>
                <Box
                    mt = "lg"
                    p = "lg"
                    w = "100%"
                    mx = "auto"
                    style = {{border: "1px solid var(--mantine-color-blue-9)" , borderRadius: "8px"}}
                >
                    <Title order = {1}> {listing.title} </Title>
                    <Text mt = "md"> Publisher: {listing.publisher}</Text>
                    <Text mt = "md"> Volunteer Work: {listing.description}</Text>
                    <Text mt = "md"> Location: {listing.location}</Text>
                    <Text mt = "md"> Date: {listing.date}</Text>

                    <Button mt = "lg">Volunteer</Button>
                </Box>

                
        </main>
    )
}

export default Listings;