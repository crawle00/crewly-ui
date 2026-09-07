import {Box, Title, Text, Button , Avatar , Group , Paper , Stack , Textarea} from "@mantine/core"
import {useParams , useNavigate} from "../router"
import { getFaq, createFaq, createReports, getVolunteers, getListing, getCurrentUser, getClub , volunteerForListing } from "../api/API"
import {useEffect , useState} from "react"

function Listings(){ 
    const navigate = useNavigate()

    const {id} = useParams()
    const [listings, setListing] = useState(null)
    const [faq, setFaq] = useState([])
    const [question, setQuestion] = useState("")
    const [reports, setReports] = useState("")
    const [volunteers, setVolunteers] = useState([])
    const [currentUser, setCurrentUser] = useState(null)
    const [club, setClub] = useState(null)

   const handleSubmitQuestion = async () => {
    if (!question.trim()) return

    try {
        const newQuestion = await createFaq(id, question)

        setFaq((currentFaq) => [...currentFaq, newQuestion])
        setQuestion("")
    } catch (error) {
        console.log("FAQ STATUS:", error.response?.status)
        console.log("FAQ CODE:", error.response?.data?.error?.code)
        console.log("FAQ MESSAGE:", error.response?.data?.error?.message)
        console.log("FAQ FIELD:", error.response?.data?.error?.details?.[0]?.field)
        console.log("FAQ DETAIL MESSAGE:", error.response?.data?.error?.details?.[0]?.message)
        }
    }

    const handleVolunteer = async () => {
        const updatedListing = await volunteerForListing(id)
        setListing(updatedListing)

        const updatedVolunteers = await getVolunteers(id)
        setVolunteers(updatedVolunteers)
    }

    const handleSubmitReports = async () => {
    if (!reports.trim()) return

    try {
        await createReports(id, reports)
        setReports("")
    } catch (error) {
        console.log("REPORT STATUS:", error.response?.status)
        console.log("REPORT CODE:", error.response?.data?.error?.code)
        console.log("REPORT MESSAGE:", error.response?.data?.error?.message)
        console.log("REPORT FIELD:", error.response?.data?.error?.details?.[0]?.field)
        console.log("REPORT DETAIL MESSAGE:", error.response?.data?.error?.details?.[0]?.message)
        }
    }

    useEffect(() => {
            getListing(id).then((data) => {
                //console.log(data)
                setListing(data)
        });
    }, [id])
    useEffect(() => {
        getFaq(id).then((data) => {
            //console.log(data)
            setFaq(data)
        })
    }, [id])
    useEffect(() => {
        getVolunteers(id).then((data) => {
            //console.log(data)
            setVolunteers(data)
        })
    }, [id])
    useEffect(() => {
        getCurrentUser().then((data) => {
            //console.log(data)
            setCurrentUser(data)
        })
    }, [])
    useEffect(() => {
        if (!listings) return
        getClub(listings.clubId).then((data) => {
                //console.log("CLUB DATA", data)
                setClub(data)
        })
        .catch((error) => {
            console.log("CLUB ERROR:", error.response?.status, error.response?.data)
        })
    }, [listings])

    
    const isOwner =
        currentUser &&
        listings &&
        String(currentUser._id) === String(listings.createdBy)

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
                    <Text mt = "md"> Club: {club ? club.name : "Loading"}</Text>
                    <Text mt = "md"> Volunteer Work: {listings.description}</Text>
                    <Text mt = "md"> Location: {listings.location.name}</Text>
                    <Text mt = "md"> Date: {new Date(listings.startsAt).toLocaleString()}</Text>
                    <Text mt = "md"> Ends: {new Date(listings.endsAt).toLocaleString()}</Text>

                    <Button mt = "lg" onClick = {handleVolunteer}>Volunteer</Button>
                    {isOwner && (
                        <Group mt = "md">
                            <Button>Edit Listing</Button>
                            <Button>Cancel Listing</Button>
                        </Group>
                    )}
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
                                <Paper key = {item.id} withBorder p ="md" radius = "md">
                                    <Text fw={700}>{item.question}</Text>
                                    <Text size = "sm" c = "dimmed">Asked by {item.firstName} {item.lastName}</Text>
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