<script setup lang="ts">
import { FabCollection } from "@/firebase/firebase-collections-enum";
import type { UserVM } from "@/models/UserVM";
import { useCommonStore } from "@/stores/common-store";
import type { IFileInfo } from "@/types/avatar-utility-types";
import type { UserVmEditForInput } from "@/types/userVm-types";
import { getProfileTitle } from "@/utils/misc";
import { nameUser } from "@/utils/model-member-name-helpers";
import { useFetch } from "@vueuse/core";
import type { RuleExpression } from "vee-validate";
import { computed, reactive, ref, toRaw, watch } from "vue";
import AppAvatarFilePicker from "./AppAvatarFilePicker.vue";
import AppAvatarRandomPicker from "./AppAvatarRandomPicker.vue";

const props = defineProps<{
  user: UserVM;
}>();

const emits = defineEmits<{
  (e: "save", dto: UserVmEditForInput, password?: string): void;
  (e: "cancel"): void;
  (e: "update:isDirty", state: boolean): void;
  (e: "update:isCredentialChanged", state: boolean): void;
}>();

const rulesMap = new Map<string, RuleExpression<unknown>>([
  [
    "username",
    {
      required: true,
      min: 2,
      unique: {
        coll: FabCollection.users,
        field: nameUser("username"),
        exclude: props.user.username,
      },
    },
  ],
  [
    "email",
    {
      required: true,
      email: true,
      unique: [FabCollection.users, nameUser("email"), props.user.email],
    },
  ],
]);

const commonStore = useCommonStore();

const userSelectedAvatarFileData = ref<IFileInfo | undefined>();

const password = ref<string | undefined>();

const { id, name, username, bio, email, website, location, avatar, twitter } = toRaw(
  props.user
);

const editorObj = reactive<UserVmEditForInput>({
  id,
  name,
  username,
  bio,
  email,
  website,
  location,
  avatar,
  twitter,
});

const locationOptions = reactive<Array<string>>([]);

const avatarToShow = computed<string | undefined>(
  () => userSelectedAvatarFileData.value?.objUrl ?? editorObj.avatar ?? undefined
);

const avatarTitle = computed(() => getProfileTitle(editorObj.username));

const unWatchDirty = watch(
  editorObj,
  ({ id, name, username, bio, email, website, location, avatar, twitter }) => {
    const result =
      (id ?? "") !== (props.user.id.trim() ?? "") ||
      (name ?? "") !== (props.user.name.trim() ?? "") ||
      (username ?? "") !== (props.user.username.trim() ?? "") ||
      (bio ?? "") !== (props.user.bio?.trim() ?? "") ||
      (email ?? "") !== (props.user.email.trim() ?? "") ||
      (website ?? "") !== (props.user.website?.trim() ?? "") ||
      (location ?? "") !== (props.user.location?.trim() ?? "") ||
      (avatar ?? "") !== (props.user.avatar?.trim() ?? "") ||
      (twitter ?? "") !== (props.user.twitter?.trim() ?? "");

    emits("update:isDirty", result);
  }
);

const unWatchCredential = watch(
  [() => editorObj.email, () => password.value],
  ([newEmail, newPswd]) => {
    emits(
      "update:isCredentialChanged",
      (newEmail ?? "") !== (props.user.email.trim() ?? "") ||
        (newPswd?.trim() ?? "") !== ""
    );
  }
);

function save() {
  unWatchAll();

  emits("update:isDirty", false);

  editorObj.avatarFile = userSelectedAvatarFileData?.value?.file;

  emits("save", editorObj, password.value);
}

function cancel() {
  unWatchAll();

  emits("cancel");
}

function unWatchAll() {
  unWatchDirty?.();
  unWatchCredential?.();
}

function storeFileDateToState(dto: IFileInfo | undefined) {
  userSelectedAvatarFileData.value = dto;
}

async function loadLocationOptions() {
  const { data } = await useFetch("https://restcountries.com/v3.1/all?fields=name").json<
    Array<{ name: { common: string } }>
  >();

  const options = data.value?.map(({ name: { common } }) => common);

  if (!options) {
    console.warn("Load options error: no options retrieved from API.");
    return;
  }

  locationOptions.push(...options);
}
</script>

<template>
  <div class="profile-card">
    <vee-form @submit="save">
      <div class="form-group">
        <app-avatar-file-picker
          :avatar-src="avatarToShow"
          :title="avatarTitle"
          @img-loaded="commonStore.setLoading(false)"
          @file-picked="storeFileDateToState"
        />

        <app-avatar-random-picker
          :disabled="commonStore.isLoading"
          @file-picked="storeFileDateToState"
          @start="commonStore.setLoading"
        />
      </div>

      <app-form-field
        v-model="editorObj.username"
        name="username"
        placeholder="Username"
        :rules="rulesMap.get('username')"
      />

      <app-form-field
        v-model="editorObj.name"
        name="name"
        placeholder="Full Name"
        rules="required|min:4"
      />

      <app-form-field
        v-model="editorObj.bio"
        as="textarea"
        name="bio"
        label="Bio"
        rules="min:2"
        placeholder="Write a few words about yourself"
      />

      <hr />

      <app-form-field
        v-model="editorObj.email"
        name="email"
        type="email"
        :rules="rulesMap.get('email')"
        label="Email"
      />

      <app-form-field
        v-model="password"
        name="password"
        type="password"
        label="Password"
      />

      <hr />

      <app-form-field
        v-model="editorObj.website"
        autocomplete="off"
        name="website"
        rules="url"
        label="Website"
      />

      <app-form-field
        v-model="editorObj.twitter"
        autocomplete="off"
        rules="twitter"
        label="Twitter"
        name="twitter"
      />

      <app-form-field
        v-model="editorObj.location"
        autocomplete="off"
        rules="min:2"
        label="Location"
        name="location"
        list="locations_list"
        @mouseenter.once="loadLocationOptions"
      />

      <datalist id="locations_list">
        <option v-for="loc of locationOptions" :key="loc" :value="loc" />
      </datalist>

      <div class="btn-group space-between">
        <button class="btn-ghost" @click.prevent="cancel">Cancel</button>

        <button type="submit" class="btn-blue">Save</button>
      </div>
    </vee-form>
  </div>
</template>
