<script setup lang="ts">
import type { RuleExpression } from "vee-validate";
import { computed, reactive, ref, watch } from "vue";
import { FabCollection } from "../firebase/firebase-collections-enum";
import type { UserVM } from "../models/UserVM";
import { useCommonStore } from "../stores/common-store";
import type { IFileInfo } from "../types/avatar-utility-types";
import { nameUser, type UserVmEditForInput } from "../types/userVm-types";
import { getProfileTitle } from "../utils/misc";
import AvatarFilePicker from "./AvatarFilePicker.vue";
import AvatarRandomPicker from "./AvatarRandomPicker.vue";

const props = defineProps<{
  user: UserVM;
}>();

const emits = defineEmits<{
  (e: "save", dto: UserVmEditForInput): void;
  (e: "cancel"): void;
  (e: "update:isDirty", state: boolean): void;
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

const editorObj = reactive<UserVmEditForInput>(props.user);

const avatarToShow = computed<string | undefined>(
  () => userSelectedAvatarFileData.value?.objUrl ?? editorObj.avatar
);

const avatarTitle = computed(() => getProfileTitle(editorObj.username));

watch(
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

function save() {
  emits("update:isDirty", false);

  editorObj.avatarFile = userSelectedAvatarFileData?.value?.file;

  commonStore.setLoading();

  emits("save", editorObj);
}

function cancel() {
  emits("cancel");
}

function storeFileDateToState(dto: IFileInfo) {
  userSelectedAvatarFileData.value = dto;
}
</script>

<template>
  <div class="profile-card">
    <vee-form @submit="save">
      <div class="form-group">
        <avatar-file-picker
          :avatar-src="avatarToShow"
          :title="avatarTitle"
          @img-loaded="commonStore.setLoading(false)"
          @file-picked="storeFileDateToState"
        />

        <avatar-random-picker
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
      />

      <div class="btn-group space-between">
        <button class="btn-ghost" @click.prevent="cancel">Cancel</button>

        <button type="submit" class="btn-blue">Save</button>
      </div>
    </vee-form>
  </div>
</template>
