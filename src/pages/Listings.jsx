import {Box, Title, Text, Button , Avatar , Group , Paper , Stack , Textarea , Modal , TextInput , NumberInput , Switch , Drawer , ScrollArea , Divider} from "@mantine/core"
import {useParams , useNavigate} from "../router"
import { getFaq, createFaq, createReports, getVolunteers, getListing, getCurrentUser, getClub , volunteerForListing, updateListing , getReports } from "../api/API"
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
    const [rosterOpened, setRosterOpened] = useState(false)
    const [viewReportOpened, setViewReportOpened] = useState(false);
    const [loading, setLoading] = useState(true)

    //listing owner side
    const [editOpened, setEditOpened] = useState(false)
    const [editTitle, setEditTitle] = useState("")
    const [editDescription, setEditDescription] = useState(false)
    const [editLocationName, setEditLocationName] = useState("")
    const [editLocationAddress, setEditLocationAddress] = useState("")
    const [editIsRemote, setEditIsRemote] = useState(false)
    const [editCapacity, setEditCapacity] = useState("")
    const [editStartsAt, setEditStartsAt] = useState("")
    const [editEndsAt, setEditEndsAt] = useState("")
    const [reportsOpened, setReportsOpened] = useState(false);
    const [listingReports, setListingReports] = useState("")

   const handleSubmitQuestion = async () => {
    if (!question.trim()) return

    try {
        const newQuestion = await createFaq(id, question)

        setFaq((currentFaq) => [...currentFaq, newQuestion])
        setQuestion("")
    } catch (error) {
        console.error("UPDATE LISTING ERROR:", error.response?.data || error)
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
        console.error("UPDATE LISTING ERROR:", error.response?.data || error)
        }
    }

    //listing Owner Side
    const handleOpenEdit = () => {
        setEditTitle(listings.title)
        setEditDescription(listings.description)

        setEditLocationName(listings.location?.name ?? "")
        setEditLocationAddress(listings.location?.address ?? "")
        setEditIsRemote(listings.location?.isRemote ?? false)


        setEditCapacity(listings.capacity ?? "")

        setEditStartsAt(
        listings.startsAt
            ? new Date(listings.startsAt).toISOString().slice(0, 16)
            : ""
        )
        setEditEndsAt(
        listings.endsAt
            ? new Date(listings.endsAt).toISOString().slice(0, 16)
            : ""
        )
        setEditOpened(true)
    }

    const handleSaveEdit = async () => {
        const updates = {
            title: editTitle,
            description: editDescription,
            location: {
                name: editLocationName,
                address: editLocationAddress,
                isRemote: editIsRemote,
            },
            capacity: editCapacity === "" ? null : Number(editCapacity),
            startsAt: new Date(editStartsAt),
            endsAt: new Date(editEndsAt),
        }

        try {
            const updatedListing = await updateListing(id, updates)

            setListing(updatedListing)
            setEditOpened(false)
        } catch (error) {
            console.error("UPDATE LISTING ERROR:", error.response?.data || error)
        }
    }

    const handleCancelListing = async () => {
        try {
            const updatedListing = await updateListing(id, {
                isCancelled: true
            })

        setListing(updatedListing)
        } catch (error) {
            console.error(
                "CANCEL LISTING ERROR:",
                error.response?.data || error
            )
        }
    }   

    const handleOpenReports = async () => {
    try {
            const data = await getReports(id);
            setListingReports(data);
            setReportsOpened(true);
        } catch (error) {
            console.error("GET REPORTS ERROR:", error.response?.data || error);
        }
    }


    useEffect(() => {
            getListing(id).then((data) => {
                setListing(data)
        })
        .catch((error) =>{
            if (error.response?.status === 401) {
                navigate('/login')
                return
            }
            console.log("GET LISTING ERROR:" , error.response?.status, error.response?.data)
        })
        .finally(() => {
            setLoading(false)
        })
    }, [id])
    useEffect(() => {
        getFaq(id).then((data) => {
            setFaq(data)
        })
    }, [id])
    useEffect(() => {
        getVolunteers(id).then((data) => {
            setVolunteers(data)
        })
    }, [id])
    useEffect(() => {
        getCurrentUser().then((data) => {
            setCurrentUser(data)
        })
    }, [])
    useEffect(() => {
        if (!listings) return
        getClub(listings.clubId).then((data) => {
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
        return (
            <Stack align = "center" justify = "center" mih = "100vh">
                <Title order ={2}>Looks like this listing isn't available right now.</Title>
                <Button onClick={() => navigate("/")}>View Other Listings</Button>
            </Stack>
        )
    }


    return(
        <Box>

            <Group justify = "flex-start">
                <Button
                    variant = "subtle"
                    onClick = {() => navigate("/")}
                    size="lg"
                >
                    Back to Listings
                </Button>
            </Group>

            {isOwner && (
                        <Group justify = "flex-end" mt = "md" px="md">
                            <Button onClick={handleOpenEdit}>Edit Listing</Button>
                                <Modal opened={editOpened} onClose={() => setEditOpened(false)} title="Edit Listing" centered >
                                    <TextInput label= "Title" value={editTitle} onChange={(event) => setEditTitle(event.currentTarget.value)} mb="md" />
                                    <Textarea justify="flex-end" value={editDescription} onChange={(event) => setEditDescription(event.currentTarget.value)} />
                                    <TextInput label= "Location" value={editLocationName} onChange={(event) => setEditLocationName(event.currentTarget.value)}mb="md" />
                                    <TextInput label= "Address" value={editLocationAddress} onChange={(event) => setEditLocationAddress(event.currentTarget.value)}mb="md" />
                                    <Switch label= "Remote" checked={editIsRemote} onChange={(event) => setEditIsRemote(event.currentTarget.checked)} mb="md" />
                                    <NumberInput label= "Capacity" value={editCapacity} onChange={setEditCapacity} min={1} mb="md" />
                                    <TextInput type="datetime-local" label="Start Time" value={editStartsAt} onChange={(event) => setEditStartsAt(event.currentTarget.value)} mb="md" />
                                    <TextInput type="datetime-local" label="End Time" value={editEndsAt} onChange={(event) => setEditEndsAt(event.currentTarget.value)} mb="lg" />
                                    <Group justify="flex-end">
                                        <Button variant="default" onClick={() => setEditOpened(false)}>cancel</Button>
                                        <Button onClick={handleSaveEdit}>Save Changes</Button>
                                    </Group>
                                </Modal>
                            <Button color ="red" onClick={handleCancelListing}>Cancel Listing</Button>
                        </Group>
                    )}

            <Stack gap = "x1">
                <Box
                    mt = "lg"
                    p = "lg"
                    w = "60%"
                    mx = "auto"
                    bg = "#fafafa"
                    style = {{border: "1px solid var(--mantine-color-blue-9)" , borderRadius: "8px" , textAlign: "center"}}  
                >
                    <Group justify="center" mb="md">
                        <Text fw={700}>
                            {club ? club.name : "Loading"}
                        </Text>
                    </Group>   
                    <Title order = {1}> {listings.title} </Title>
                    <Text mt = "md"> <Text span fw ={700}>Volunteer Work:</Text> {listings.description}</Text>
                    <Text mt = "md"> <Text span fw ={700}>Location:</Text> {listings.location.name}</Text>
                    <Text mt = "md"> <Text span fw ={700}>Date:</Text> {new Date(listings.startsAt).toLocaleString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit"
                    })}
                    </Text>
                    <Text mt = "md"> <Text span fw ={700}>End Time:</Text> {new Date(listings.endsAt).toLocaleString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit"
                    })}
                    </Text>

                    <Group justify="center" mt="lg" gap="x1">
                        <Button mt = "lg" onClick = {handleVolunteer}>Volunteer</Button>
                        <Button mt = "lg" variant = "light" onClick={() => setRosterOpened(true)}>View Volunteer Roster</Button>
                    </Group>
                    
                    <Group justify="center" mt="md">
                        {!isOwner ? (
                            <Button variant="light" onClick={() => setViewReportOpened(true)}>
                                Submit a report or Feedback
                            </Button>
                        ) : (
                            <Button color = "red" onClick={handleOpenReports}>
                                View Reports & Feedback
                            </Button>
                        )}
                    </Group>

                    {!isOwner && (
                        <Modal opened={viewReportOpened} onClose={() => setViewReportOpened(false)} title="Report Listing" centered>
                            <Stack>
                                <Text>
                                    Have some feedback for this listing? Submit your feedback here.
                                </Text>

                                <Textarea
                                    label="Report"
                                    placeholder="Describe your concern..."
                                    minRows={5}
                                    value={reports}
                                    onChange={(event) => setReports(event.currentTarget.value)}
                                />

                                <Group justify="flex-end">
                                    <Button variant="default" onClick={() => setViewReportOpened(false)} > Cancel </Button>

                                    <Button color="red"onClick={handleSubmitReports}> Submit Report </Button>
                                </Group>
                            </Stack>
                        </Modal>
                    )}
                    {isOwner && (
                        <Modal opened={reportsOpened} onClose={() => setReportsOpened(false)} title="Listing Reports" centered >
                            <ScrollArea h={400}>
                                <Stack>
                                    {listingReports.length === 0 ? (
                                        <Text c="dimmed">
                                            No reports have been submitted.
                                        </Text>
                                    ) : (
                                        listingReports.map((report) => (
                                            <Paper
                                                key={report._id} withBorder p="md"  radius="md" >
                                                <Text>{report.reports}</Text>
                                                <Text size="sm" c="dimmed" mt="xs" > By {report.firstName}{" "}{report.lastName}</Text>
                                            </Paper>
                                        ))
                                    )}
                                </Stack>
                            </ScrollArea>
                        </Modal>
                    )}
                </Box>

                <Drawer
                    opened={rosterOpened}
                    onClose={() => setRosterOpened(false)}
                    title="Volunteer Roster"
                    position="right"
                >
                    <Text size = "sm" c = "dimmed" mb = "md">{volunteers.length} / {listings.capacity ?? "∞"} volunteers</Text>

                    <Stack>
                        {volunteers.length === 0 ? (
                            <Text c = "dimmed">No Volunteers Yet</Text>
                        ) : (
                            volunteers.map((volunteer) => (
                                <Group key = {volunteer._id}>
                                    <Paper key ={volunteer._id} withBorder p ="sm" radius = "md" w ="100%" bd="1px solid var(--mantine-color-gray-4)">
                                        <Avatar radius = "x1">
                                            {volunteer.firstName.charAt(0) || "?"}
                                        </Avatar>
                                        <Text>{volunteer.firstName} {volunteer.lastName}</Text>
                                    </Paper>
                                </Group>
                            ))
                        )}
                    </Stack>
                </Drawer>

                <Box
                    mt = "lg"
                    p = "lg"
                    w = "60%"
                    mx = "auto"
                    bg = "#fafafa"
                    style = {{border: "1px solid var(--mantine-color-blue-9)" , borderRadius: "8px" , textAlign: "center"}}
                >
                    <Title order={2} mb="md">Frequently Asked Questions & Answers</Title>
                    <Stack>
                        <Title order={4}>Ask a Question</Title>
                        <Textarea
                            placeholder="Type your question here..."
                            minRows={5}
                            value={question}
                            onChange={(event) =>setQuestion(event.currentTarget.value)}
                        />
                        <Group justify="flex-end">                          
                            <Button w="fit-content" onClick={handleSubmitQuestion}>Submit Question</Button>
                        </Group>      
                    </Stack>

                    <Divider my="lg"/>

                    <Title order={4} ta="left" mb="md">
                        Submitted Questions
                    </Title>
                        <ScrollArea h={200}>
                                <Stack>
                                    {faq.length === 0 ? (
                                        <Text c="dimmed">No questions have been submitted yet.</Text>
                                    ) : (
                                        faq.map((item) => (
                                            <Paper key={item.id} withBorder p="md" radius="md">
                                                <Text fw={700}> {item.question} </Text>
                                                <Text size="sm" c="dimmed" mt="xs"> Asked by {item.firstName} {" "} {item.lastName}</Text>
                                            </Paper>
                                        ))
                                    )}
                                </Stack>
                        </ScrollArea>
                </Box>
            </Stack>    
        </Box>
    )
}

export default Listings;