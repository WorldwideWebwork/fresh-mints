<script lang="ts">
  import { leadStore } from '../../stores/lead-store.svelte';
  import { toast } from '../../stores/toast.svelte';
  import { validateNewLead } from '../../services/lead-validation';
  import { PROFESSION_CONFIGS, type ProfessionCategory } from '../../types/profession';
  import { STATE_MODAL_OPTIONS, getMajorCities } from '../../types/states';
  import type { Lead } from '../../types/lead';
  import Dialog from '../atoms/Dialog.svelte';
  import Form from '../atoms/Form.svelte';
  import FormField from '../atoms/FormField.svelte';
  import FormRow from '../atoms/FormRow.svelte';
  import Input from '../atoms/Input.svelte';
  import Select from '../atoms/Select.svelte';
  import Button from '../atoms/Button.svelte';

  interface Props {
    open?: boolean;
    onclose?: () => void;
  }

  let { open = $bindable(false), onclose }: Props = $props();

  // Sentinel option that swaps the curated city list for a free-text field.
  const OTHER_CITY = '__other_city__';

  const PROFESSION_OPTIONS = Object.values(PROFESSION_CONFIGS).map((p) => ({ value: p.id, label: p.label }));

  const emptyForm = () => ({
    fullName: '',
    profession: '',
    state: '',
    city: '',
    licenseNumber: '',
    collegeOrSchool: '',
    issueDate: '',
  });

  let form = $state(emptyForm());
  let hasAttemptedSubmit = $state(false);
  let isTypingCity = $state(false);
  let isSaving = $state(false);

  // Profession is a plain string in the form; validateNewLead verifies the key.
  const toLeadInput = (): Partial<Lead> => ({
    ...form,
    profession: (form.profession || undefined) as ProfessionCategory | undefined,
  });

  const validation = $derived(validateNewLead(toLeadInput(), leadStore.leads));
  const visibleErrors = $derived(hasAttemptedSubmit && !validation.ok ? validation.errors : {});

  const cityChoices = $derived(getMajorCities(form.state).map((city) => ({ value: city, label: city })));
  const hasCuratedCities = $derived(cityChoices.length > 0);
  const shouldShowCitySelect = $derived(hasCuratedCities && !isTypingCity);
  const cityOptions = $derived([...cityChoices, { value: OTHER_CITY, label: 'Other city (type it in)' }]);

  function handleStateChanged() {
    form.city = '';
    isTypingCity = false;
  }

  function handleCityChosen(e: Event & { currentTarget: HTMLSelectElement }) {
    const chosen = e.currentTarget.value;
    const isOther = chosen === OTHER_CITY;
    form.city = isOther ? '' : chosen;
    isTypingCity = isOther;
  }

  function handleClose() {
    open = false;
    onclose?.();
  }

  async function handleSubmit() {
    if (isSaving) return;
    hasAttemptedSubmit = true;

    // Validate again at submit time so createdAt and duplicate checks are current.
    const result = validateNewLead(toLeadInput(), leadStore.leads);
    if (!result.ok) {
      toast.warning('Lead not saved', 'Check the highlighted fields and try again.');
      return;
    }

    isSaving = true;
    try {
      const created = await leadStore.addLead(result.lead);
      toast.success('Lead added', `${created.fullName} is now in Minted Leads.`);
      handleClose();
    } catch (e) {
      toast.error('Could not save lead', e instanceof Error ? e.message : undefined);
    } finally {
      isSaving = false;
    }
  }

  // Wipe the form whenever the dialog closes, however it was closed.
  $effect(() => {
    if (open) return;
    form = emptyForm();
    hasAttemptedSubmit = false;
    isTypingCity = false;
  });
</script>

<Dialog bind:open {onclose} title="Add Lead" description="Track and skip trace a newly licensed professional" maxWidth="max-w-lg">
  <Form onsubmit={handleSubmit}>
    <FormField label="Full name" required error={visibleErrors.fullName}>
      <Input bind:value={form.fullName} placeholder="First and last name" autocomplete="off" />
    </FormField>

    <FormRow>
      <FormField label="Profession" required error={visibleErrors.profession}>
        <Select bind:value={form.profession} options={PROFESSION_OPTIONS} placeholder="Select profession" />
      </FormField>
      <FormField label="Licensed state" required error={visibleErrors.state}>
        <Select bind:value={form.state} options={STATE_MODAL_OPTIONS} placeholder="Select state" onchange={handleStateChanged} />
      </FormField>
    </FormRow>

    <FormRow>
      <FormField label="City">
        {#if shouldShowCitySelect}
          <Select value={form.city} options={cityOptions} placeholder="Select city" onchange={handleCityChosen} />
        {:else}
          <Input bind:value={form.city} placeholder="City" autocomplete="off" />
        {/if}
      </FormField>
      <FormField label="License number" required error={visibleErrors.licenseNumber}>
        <Input bind:value={form.licenseNumber} placeholder="As printed on the license" autocomplete="off" />
      </FormField>
    </FormRow>

    <FormField label="College, university or board program">
      <Input bind:value={form.collegeOrSchool} autocomplete="off" />
    </FormField>

    <FormField label="License issue date" error={visibleErrors.issueDate}>
      <Input type="date" bind:value={form.issueDate} />
    </FormField>

    {#snippet actions()}
      <Button variant="ghost" size="sm" onclick={handleClose}>Cancel</Button>
      <Button type="submit" size="sm" loading={isSaving}>Save lead</Button>
    {/snippet}
  </Form>
</Dialog>
