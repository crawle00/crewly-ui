import {Box, Title, Text, Button , Avatar , Group , Paper , Stack , Textarea} from "@mantine/core"
import {useParams , useNavigate} from "../router"
import { getFaq, createFaq, createReports, getVolunteers, getListing,  } from "../api/API"
import {useEffect , useState} from "react"

function Listings(){ 
    const navigate = useNavigate()

    const {id} = useParams()
    const [listings, setListing] = useState(null)
    const [faq, setFaq] = useState([])
    const [question, setQuestion] = useState("")
    const [reports, setReports] = useState("")
    const [volunteers, setVolunteers] = useState([])

    const handleSubmitQuestion = async () => {
        if (!question.trim()) return

        const newQuestion = await createFaq(id, question)

        setFaq((currentFaq) => [...currentFaq, newQuestion])
        setQuestion("")
    }

    const handleSubmitReports = async () => {
        if (!reports.trim()) return

        const newReports = await createReports(id, reports)
        setReports ("")
    }
    
    useEffect(() => {
            getListing(id).then((data) => {
                console.log(data)
                setListing(data)
        });
    }, [id])
    useEffect(() => {
        getFaq(id).then((data) => {
            console.log(data)
            setFaq(data)
        })
    }, [id])
    useEffect(() => {
        getVolunteers(id).then((data) => {
            console.log(data)
            setVolunteers(data)
        })
    }, [id])
    

    if (!listings) {
        return <Text>Loading...</Text>
    }


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

                    <Title order = {1}> {listings.title} </Title>
                    <Text mt = "md"> Publisher: {listings.publisher}</Text>
                    <Text mt = "md"> Volunteer Work: {listings.description}</Text>
                    <Text mt = "md"> Location: {listings.location}</Text>
                    <Text mt = "md"> Date: {listings.date}</Text>

                    <Button mt = "lg">Volunteer</Button>
                </Box>

                <Box>
                    <Title order={2} mb="md">Volunteer Roster</Title>

                    <Paper withBorder p="md">
                        <Stack>
                            {volunteers.length === 0 ? (
                                <Text c ="dimmed">No Volunteers yet.</Text>
                            ) : (
                            volunteers.map((volunteer) => (
                                <Group key={volunteer._id}>
                                    <Avatar radius="xl">{volunteer.firstName.charAt(0)}</Avatar>
                                    <Text>{volunteer.firstName} {volunteer.lastName}</Text>
                                </Group>
                            ))
                            )}
                        </Stack>
                    </Paper>
                </Box>

                <Box>
                    <Title order={2} mb="md">Frequently Asked Questions & Answers</Title>
                    <Paper withBorder p="md">
                        <Stack>
                            {faq.map((item) => (
                                <Paper>
                                    <Text>{item.question}</Text>
                                </Paper>
                            ))}
                            <Textarea
                                label="Ask a question"
                                placeholder="Type your question here..."
                                minRows={3}
                                value ={question}
                                onChange = {(event) => setQuestion(event.currentTarget.value)}
                            />

                            <Button w="fit-content" onClick={handleSubmitQuestion}>
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
                                value ={reports}
                                onChange ={(event) => setReports(event.currentTarget.value)}
                            />

                            <Button w="fit-content" onClick={handleSubmitReports}>Submit Feedback</Button>
                        </Stack>
                    </Paper>
                </Box>
            </Stack>
                
        </main>
    )
}

export default Listings;