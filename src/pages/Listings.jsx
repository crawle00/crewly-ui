import {Box, Title, Text, Button , Avatar , Group , Paper , Stack , Textarea , Modal , TextInput , NumberInput , Switch , Drawer , ScrollArea , Divider, Image} from "@mantine/core"
import {useParams , useNavigate} from "../router"
import { getFaq, createFaq, createFaqReply, createReports, getVolunteers, getListing, getCurrentUser, getClub, volunteerForListing, removeVolunteerFromListing, updateListing, getReports } from "../api/API"
import {useEffect , useState} from "react"

function ReplyItem({
    reply,
    questionId,
    replies,
    replyTo,
    setReplyTo,
    replyText,
    setReplyText,
    handleSubmitReply,
}) {
    const childReplies = replies.filter(
        (child) =>
            String(child.parentReplyId) === String(reply._id)
    )

    const [showReplies, setShowReplies] = useState(false)

    return (
        <Stack mt="sm">
            <Group>
                <Avatar src={reply.pfp} size="sm" />
                <Text size="xs" c ="dimmed">{reply.firstName}{" "}{reply.lastName}</Text>
                <Text size="sm">{reply.reply}</Text>
                <Button
                    variant = "subtle"
                    size = "xs"
                    onClick={() => {
                    setReplyTo({
                        questionId,
                        replyId: reply._id
                    })
                        setReplyText("")
                    }}
                >
                     Reply
                </Button>
                <Group w ="100%" justify="flex-end" color="var(--mantine-color-blue-9)">
                     {childReplies.length > 0 && (
                        <Button
                            variant="subtle"
                            size="xs"
                            onClick={() => setShowReplies(!showReplies)}
                        >
                            {showReplies
                                ? "Hide replies"
                                : `View ${childReplies.length} ${
                                    childReplies.length === 1
                                        ? "reply"
                                        : "replies"
                                }`
                            }
                        </Button>
                    )}
                </Group>
            </Group>

            {replyTo?.questionId === questionId && 
                String(replyTo.replyId) === String(reply._id) && (
                    <Stack mt ="sm">
                        <Textarea
                            placeholder="Write a reply."
                            minRows={2}
                            value={replyText}
                            onChange={(event) =>
                                setReplyText(event.currentTarget.value)
                            }
                        />

                        <Group justify="flex-end">
                            <Button
                                size="xs"
                                onClick={() =>
                                    handleSubmitReply(questionId, reply._id)
                                }
                            >
                                Submit Reply
                            </Button>
                        </Group>
                    </Stack>
                )
            }

            {childReplies.length > 0 && (
                <>

                    {showReplies && (
                            <Stack mt="sm" ml={50} pl ="md" style={{borderLeft: "2px solid var(--mantine-color-blue-9)"}}>
                                {childReplies.map((childReply) => (
                                    <ReplyItem
                                        key={childReply._id}
                                        reply={childReply}
                                        questionId={questionId}
                                        replies={replies}
                                        replyTo={replyTo}
                                        setReplyTo={setReplyTo}
                                        replyText={replyText}
                                        setReplyText={setReplyText}
                                        handleSubmitReply={handleSubmitReply}
                                    />
                                ))}
                            </Stack>
                    )}
                </>
            )}
        </Stack>
    )
}

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
    const [replyTo, setReplyTo] = useState(null)
    const [replyText, setReplyText] = useState("")

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
            await createFaq(id, question)

            const updatedFaq = await getFaq(id)
            setFaq(updatedFaq)
            setQuestion("")
        } catch (error) {
            console.error("SUBMIT FAQ ERROR:", error.response?.data || error)
            }
        }

    const handleSubmitReply = async (questionId, parentReplyId = null) => {
        if(!replyText.trim()) return

        try {
            await createFaqReply(questionId, replyText, parentReplyId)

            const updatedFaq = await getFaq(id)
            setFaq(updatedFaq)

            setReplyText("")
            setReplyTo(null)
        } catch (error) {
            console.error("CREATE REPLY ERROR:" , error.response?.data || error)
        }
    }

    const handleVolunteer = async () => {
        try{
            let updatedListing

            if(isVolunteered)   {
                updatedListing = await removeVolunteerFromListing(id)
            } else {
                updatedListing = await volunteerForListing(id)
            }
            setListing(updatedListing)

            const updatedVolunteers = await getVolunteers(id)
            setVolunteers(updatedVolunteers)
        } catch (error) {
            console.error("VOLUNTEER ERROR:") || error
        }
    }

    const handleSubmitReports = async () => {
        if (!reports.trim()) return

        try {
            await createReports(id, reports)
            setReports("")
        } catch (error) {
            console.error("SUBMIT REPORT ERROR:", error.response?.data || error)
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
                isCancelled: !listings.isCancelled
            })

        setListing(updatedListing)
        } catch (error) {
            console.error("CANCEL LISTING ERROR:", error.response?.data || error)
        }
    }

    const handleOpenReports = async () => {
    try {
            const data = await getReports(id);
            setListingReports(data);
            setReportsOpened(true);
        } catch (error) {
            console.error("OPEN REPORTS ERROR:", error.response?.data || error);
        }
    }


    useEffect(() => {
            getListing(id).then((data) => {
                setListing(data)
        })
        .catch((error) =>{
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
        .catch((error) =>{
            console.log("GET FAQ ERROR:" , error.response?.status, error.response?.data)
        })
    }, [id])
    useEffect(() => {
        getVolunteers(id).then((data) => {
            setVolunteers(data)
        })
        .catch((error) =>{
            console.log("GET VOLUNTEER ERROR:" , error.response?.status, error.response?.data)
        })
    }, [id])
    useEffect(() => {
        getCurrentUser().then((data) => {
            setCurrentUser(data)
        })
        .catch((error) =>{
            console.log("GET CURRENT USER ERROR:" , error.response?.status, error.response?.data)
        })
    }, [])
    useEffect(() => {
        if (!listings) return
        getClub(listings.clubId).then((data) => {
                setClub(data)
        })
        .catch((error) => {
            console.log("GET CLUB ERROR:", error.response?.status, error.response?.data)
        })
    }, [listings])

    
    const isOwner =
        currentUser &&
        listings &&
        String(currentUser._id) === String(listings.createdBy)

    if (loading) {
        return (
            <Stack align="center" justify="center" mih="100vh">
                <Title order={2}>Pulling Up Listing.</Title>
            </Stack>
        )
    }

    if (!listings) {
        return (
            <Stack align = "center" justify = "center" mih = "100vh">
                <Title order ={2}>Looks like this listing isn't available right now.</Title>
                <Button onClick={() => navigate("/")}>View Other Listings</Button>
            </Stack>
        )
    }

    const isVolunteered =
        currentUser &&
        listings &&
        listings.volunteers?.some(
            (volunteerId) =>
                String(volunteerId) === String(currentUser._id)
        )


    return(
        <Box>
            {isOwner && (
                <Group justify = "flex-end" mt = "md" px="md" wrap="wrap">
                    <Button color="var(--mantine-color-blue-9)" onClick={handleOpenEdit}>Edit Listing</Button>
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
                        <Button color ={listings.isCancelled ? "var(--mantine-color-blue-9)" : "red"} onClick={handleCancelListing}>{listings.isCancelled ? "Open Listing" : "Cancel Listing"}</Button>
                </Group>
            )}
            <Stack gap = "x1">
                <Box
                    mt = "lg"
                    p = "lg"
                    w = {{base: "95%", sm: "90%", md: "60%"}}
                    mx = "auto"
                    bg = "#fafafa"
                    style = {{border: "1px solid var(--mantine-color-blue-9)" , borderRadius: "8px" , textAlign: "center"}}  
                >
                    {listings.bannerImage && (
                        <Image src={listings.bannerImage} alt={""} radius="md" h={250} fit="cover" mb="lg"/>
                    )}
                    <Group justify="center" mb="md">
                        <Avatar
                            src={club?.pfp}
                            alt={club?.name}
                            size="lg"
                            radius="md"
                        />
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
                        <Button mt = "lg"  color="var(--mantine-color-blue-9)" onClick = {handleVolunteer}>{isVolunteered ? "Unvolunteer" : "Volunteer"}</Button>
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

                                    <Button color="var(--mantine-color-blue-9)" onClick={handleSubmitReports}> Submit Report </Button>
                                </Group>
                            </Stack>
                        </Modal>
                    )}
                    {isOwner && (
                        <Modal opened={reportsOpened} onClose={() => setReportsOpened(false)} title="Reports for this listing" centered >
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
                                                <Group>
                                                    <Avatar>{report.pfp}</Avatar>
                                                    <Text size="sm" c="dimmed" mt="xs" >{report.firstName}{" "}{report.lastName}</Text>
                                                </Group>
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
                                            {volunteer.pfp}
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
                    w = {{base: "95%", sm: "90%", md: "60%"}}
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
                            <Button w="fit-content" color="var(--mantine-color-blue-9)" onClick={handleSubmitQuestion}>Submit Question</Button>
                        </Group>      
                    </Stack>

                    <Divider my="lg"/>

                    <Title order={4} ta="left" mb="md">
                        Submitted Questions
                    </Title>

                    <Stack>
                        {faq.length === 0 ? (
                            <Text c="dimmed">No questions have been submitted yet.</Text>
                        ) : (
                            faq.map((item) => (
                                <Box key={item._id}>

                                    <Paper key={item._id} withBorder p="md" radius="md">
                                        <Text fw={700} ta="left">
                                            {item.question}
                                        </Text>

                                        <Group mt="xs">
                                            <Avatar
                                                src={item.pfp}
                                                alt=""
                                                size="sm"
                                            />
                                        <Text size="sm" c="dimmed">{item.firstName} {" "} {item.lastName}</Text>
                                            <Button
                                                variant="subtle"
                                                size="xs"
                                                onClick={() => {
                                                    setReplyTo({
                                                        questionId: item._id,
                                                        replyId: null
                                                    })
                                                        setReplyText("")
                                                    }}
                                                >
                                                    Reply
                                            </Button>
                                        </Group>

                                        {replyTo?.questionId === item._id && replyTo.replyId === null && (
                                            <Stack mt="sm">
                                                <Textarea
                                                    placeholder="Write a reply..."
                                                    minRows={2}
                                                    value={replyText}
                                                    onChange={(event) =>
                                                        setReplyText(event.currentTarget.value)
                                                    }
                                                />

                                                <Group justify="flex-end">
                                                    <Button size="xs" onClick={() => handleSubmitReply(replyTo.questionId , replyTo.replyId)}>
                                                        Submit Reply
                                                    </Button>
                                                </Group>
                                            </Stack>
                                        )}

                                        <Box ml="lg" bg="gray.1" style={{borderRadius: "5px"}}>
                                            <Stack mt="xs" ml={50}>
                                                {item.replies?.filter(
                                                    (reply) => reply.parentReplyId === null
                                                ).map((reply) => (
                                                    <ReplyItem
                                                        key={reply._id}
                                                        reply={reply}
                                                        questionId={item._id}
                                                        replies={item.replies}
                                                        replyTo={replyTo}
                                                        setReplyTo={setReplyTo}
                                                        replyText={replyText}
                                                        setReplyText={setReplyText}
                                                        handleSubmitReply={handleSubmitReply}
                                                    />
                                                ))}
                                            </Stack>
                                        </Box>
                                    </Paper>

                                </Box>
                            ))
                        )}
                    </Stack>
                </Box> 
            </Stack> 
        </Box>
    )
}

export default Listings;