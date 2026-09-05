import {Accordion, Box, Title, Text, Button , Avatar , Group , Paper , Stack , Textarea} from "@mantine/core";
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
const fakeRoster = [
    {
        id: 1,
        name: "John Smith"
    },
    {
        id: 2,
        name: "Jane Doe"
    },
    {
        id: 3,
        name: "Alex Johnson"
    }
];

const fakeFAQ = [
    {
        question: "Where should I meet?",
        answer: "Meet at Baldor 143 at the listed start time."
    },
    {
        question: "How long will the volunteer work take?",
        answer: "The expected time commitment is approximately two hours."
    },
    {
        question: "What should I bring?",
        answer: "Bring your laptop and anything else you normally use for IT support."
    }
];

function Listings(){ 
    const navigate = useNavigate();
    const {id} = useParams();
    const listing = fakeListings[0];
    //const listing = fakeListings.find((job) => job.id === Number(id));
    

    return(
        <main>

            <Group justify = "flex-end">
                <Button
                    variant = "subtle"
                    onClick = {() => navigate("/")}
                >
                    Back to Listings
                </Button>
            </Group>

            <Stack gap = "x1">
                
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

                <Box>
                    <Title order={2} mb="md">Volunteer Roster</Title>

                    <Paper withBorder p="md">
                        <Stack>
                            {fakeRoster.map((member) => (
                                <Group key={member.id}>
                                    <Avatar radius="xl">{member.name.charAt(0)}</Avatar>
                                    <Text>{member.name}</Text>
                                </Group>
                            ))}
                        </Stack>
                    </Paper>
                </Box>

                <Box>
                    <Title order={2} mb="md">Frequently Questions & Answers</Title>
                    <Paper withBorder p="md">
                        <Stack>
                            <Textarea
                                label="Ask a question"
                                placeholder="Type your question here..."
                                minRows={3}
                            />

                            <Button w="fit-content">
                                Submit Question
                            </Button>
                        </Stack>
                    </Paper>
                </Box>

                <Box>
                    <Title order={2} mb="md">Reports & Feedback</Title>

                    <Paper withBorder p="md">
                        <Stack>
                            <Text>
                                Have feedback about this listing or the volunteer
                                experience? Let the publisher know.
                            </Text>

                            <Textarea
                                label="Feedback"
                                placeholder="Enter your feedback here..."
                                minRows={4}
                            />

                            <Button w="fit-content">Submit Feedback</Button>
                        </Stack>
                    </Paper>
                </Box>
            </Stack>
                
        </main>
    )
}

export default Listings;