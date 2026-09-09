import { useEffect, useRef, useState } from "react";
import { Accordion, Alert, Box, Button, Card, Center, Group, Image, Loader, Paper, Select, SimpleGrid, Stack, TagsInput, Text, TextInput, ThemeIcon, Title } from '@mantine/core';
import { IconCalendarEvent, IconFilter, IconMapPin, IconRefresh, IconUsers } from '@tabler/icons-react';
import { getListings } from '../api/API';
import { useNavigate } from '../router';
import listingPlaceholder from '../assets/listing-placeholder.svg';

function formatDateRange(startsAt, endsAt) {
  const dateFormatter = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const timeFormatter = new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });

  if (!startsAt || !endsAt) return 'Date to be announced';

  const start = new Date(startsAt);
  const end = new Date(endsAt);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 'Date to be announced';

  const sameDay = start.toDateString() === end.toDateString();
  if (sameDay) {
    return `${dateFormatter.format(start)} · ${timeFormatter.format(start)}–${timeFormatter.format(end)}`;
  }

  return `${dateFormatter.format(start)} · ${timeFormatter.format(start)} – ${dateFormatter.format(end)} · ${timeFormatter.format(end)}`;
}

function ListingCard({ listing, onOpen }) {
  const volunteerCount = Array.isArray(listing.volunteers) ? listing.volunteers.length : 0;
  const location = listing.location?.isRemote ? 'Remote' : listing.location?.name || 'Location to be announced';

  return (
    <Card
      component="button"
      type="button"
      onClick={() => onOpen(listing._id)}
      withBorder
      padding={0}
      radius="md"
      shadow="sm"
      ta="left"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        cursor: 'pointer',
        transition: 'transform 160ms ease, box-shadow 160ms ease',
      }}
    >
      <Box pos="relative" h={{ base: 150, sm: 168 }} bg="blue.0">
        <Image
          src={listing.bannerImage || listingPlaceholder}
          alt=""
          h="100%"
          fit="cover"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = listingPlaceholder;
          }}
        />
      </Box>

      <Stack gap="md" p="lg" style={{ flex: 1 }}>
        <Box>
          <Title order={3} size="h4" lh={1.25}>{listing.title}</Title>
          <Text c="dimmed" size="sm" lineClamp={1} lh={1.5}>
            {listing.description || 'No description provided.'}
          </Text>
        </Box>

        <Stack gap="xs" mt="auto">
          <Group gap="xs" wrap="nowrap" align="flex-start">
            <ThemeIcon variant="light" size="sm" color="blue" aria-hidden="true">
              <IconCalendarEvent size={15} />
            </ThemeIcon>
            <Text size="sm" c="dark.7">{formatDateRange(listing.startsAt, listing.endsAt)}</Text>
          </Group>
          <Group gap="xs" wrap="nowrap" align="flex-start">
            <ThemeIcon variant="light" size="sm" color="blue" aria-hidden="true">
              <IconMapPin size={15} />
            </ThemeIcon>
            <Text size="sm" c="dark.7">{location}</Text>
          </Group>
          <Group gap="xs" wrap="nowrap" align="flex-start">
            <ThemeIcon variant="light" size="sm" color="blue" aria-hidden="true">
              <IconUsers size={15} />
            </ThemeIcon>
            <Text size="sm" c="dark.7">
              {volunteerCount} volunteer{volunteerCount === 1 ? '' : 's'}{listing.capacity ? ` of ${listing.capacity} needed` : ''}
            </Text>
          </Group>
        </Stack>
      </Stack>
    </Card>
  );
}

const initialFilters = {
  tags: [],
  tagMode: 'any',
  startsAfter: '',
  startsBefore: '',
  endsAfter: '',
  endsBefore: '',
  sort: 'startsAt',
  order: 'asc',
};

function buildListingParams(filters) {
  const params = {
    tags: filters.tags,
    tagMode: filters.tagMode,
    sort: filters.sort,
    order: filters.order,
  };

  for (const field of ['startsAfter', 'startsBefore', 'endsAfter', 'endsBefore']) {
    if (filters[field]) params[field] = filters[field];
  }

  return params;
}

function ListingFilters({ filters, onChange, onApply, onReset, loading }) {
  const update = (field) => (value) => onChange((current) => ({ ...current, [field]: value }));

  return (
    <Accordion variant="separated" radius="md">
      <Accordion.Item value="filters">
        <Accordion.Control icon={<IconFilter size={18} aria-hidden="true" />}>Filter and sort listings</Accordion.Control>
        <Accordion.Panel>
          <Box component="form" onSubmit={(event) => { event.preventDefault(); onApply(); }}>
            <Stack gap="md">

              <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
                <TagsInput label="Tags" placeholder="Add tags" value={filters.tags} onChange={update('tags')} clearable />
                <Select label="Tag matching" data={[{ value: 'any', label: 'Any selected tag' }, { value: 'all', label: 'All selected tags' }]} value={filters.tagMode} onChange={update('tagMode')} allowDeselect={false} />
                <Select label="Sort by" data={[{ value: 'startsAt', label: 'Start date' }, { value: 'newest', label: 'Recently added' }, { value: 'title', label: 'Title' }]} value={filters.sort} onChange={update('sort')} allowDeselect={false} />
                <Select label="Order" data={[{ value: 'asc', label: 'Ascending' }, { value: 'desc', label: 'Descending' }]} value={filters.order} onChange={update('order')} allowDeselect={false} />
              </SimpleGrid>

              <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
                <TextInput type="date" label="Starts after" value={filters.startsAfter} onChange={(event) => { const value = event.currentTarget.value; onChange((current) => ({ ...current, startsAfter: value })); }} />
                <TextInput type="date" label="Starts before" value={filters.startsBefore} onChange={(event) => { const value = event.currentTarget.value; onChange((current) => ({ ...current, startsBefore: value })); }} />
                <TextInput type="date" label="Ends after" value={filters.endsAfter} onChange={(event) => { const value = event.currentTarget.value; onChange((current) => ({ ...current, endsAfter: value })); }} />
                <TextInput type="date" label="Ends before" value={filters.endsBefore} onChange={(event) => { const value = event.currentTarget.value; onChange((current) => ({ ...current, endsBefore: value })); }} />
              </SimpleGrid>

              <Group justify="flex-end" gap="sm">
                <Button type="button" variant="subtle" leftSection={<IconRefresh size={16} />} onClick={onReset}>Reset</Button>
                <Button type="submit" loading={loading}>Apply filters</Button>
              </Group>
            </Stack>
          </Box>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}

export default function Home() {
  const pageSize = 12;
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingFilters, setApplyingFilters] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const loadMoreRef = useRef(null);
  const navigate = useNavigate();

  const loadListings = async (nextFilters, nextPage = 1, append = false, isFilterApply = false) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    if (isFilterApply) setApplyingFilters(true);
    setError(false);
    try {
      const response = await getListings({
        ...buildListingParams(nextFilters),
        page: nextPage,
        limit: pageSize,
      });
      const nextListings = Array.isArray(response) ? response : response.data ?? [];
      setListings((currentListings) => append ? [...currentListings, ...nextListings] : nextListings);
      setHasNextPage(response.page?.hasNext ?? false);
      setPage(nextPage);
    } catch {
      setError(true);
    } finally {
      if (append) setLoadingMore(false);
      else setLoading(false);
      if (isFilterApply) setApplyingFilters(false);
    }
  };

  useEffect(() => {
    loadListings(initialFilters);
  }, []);

  useEffect(() => {
    const sentinel = loadMoreRef.current;
    if (!sentinel || !hasNextPage || loading || loadingMore) return undefined;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) loadListings(appliedFilters, page + 1, true);
    });
    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [appliedFilters, hasNextPage, loading, loadingMore, page]);

  return (
    <Box maw={1440} mx="auto" p={{ base: 'md', sm: 'xl' }}>
      <Stack gap="xl">
        <Box>
          <Title order={1} size="h2">Find your next opportunity</Title>
          <Text c="dimmed" mt="xs">Make an impact with your campus community.</Text>
        </Box>

        <ListingFilters
          filters={filters}
          onChange={setFilters}
          onApply={() => {
            setAppliedFilters(filters);
            loadListings(filters, 1, false, true);
          }}
          onReset={() => {
            setFilters(initialFilters);
            setAppliedFilters(initialFilters);
            loadListings(initialFilters, 1, false, true);
          }}
          loading={applyingFilters}
        />

        {loading && (
          <Center mih={320}>
            <Loader color="blue" aria-label="Loading listings" />
          </Center>
        )}

        {!loading && error && (
          <Alert color="red" title="Listings are unavailable">
            We could not load opportunities right now. Please try again later.
          </Alert>
        )}

        {!loading && !error && listings.length === 0 && (
          <Paper withBorder p="xl">
            <Stack align="center" gap="xs">
              <Title order={3}>No opportunities yet</Title>
              <Text c="dimmed" ta="center">Check back soon for new ways to get involved.</Text>
            </Stack>
          </Paper>
        )}

        {!loading && !error && listings.length > 0 && (
          <>
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing={{ base: 'md', sm: 'xl' }} verticalSpacing={{ base: 'md', sm: 'xl' }}>
              {listings.map((listing) => (
                <ListingCard key={listing._id} listing={listing} onOpen={(id) => navigate(`/listings/${id}`)} />
              ))}
            </SimpleGrid>
            {hasNextPage && (
              <Center ref={loadMoreRef} h={72} mt="md">
                <Loader size="sm" color="blue" aria-label="Loading more listings" />
              </Center>
            )}
          </>
        )}
      </Stack>
    </Box>
  );
}