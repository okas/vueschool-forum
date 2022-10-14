<script setup lang="ts">
import { type RuleExpression } from "vee-validate";
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import AvatarFilePicker from "../components/AvatarFilePicker.vue";
import AvatarRandomPicker from "../components/AvatarRandomPicker.vue";
import { FabCollection } from "../firebase/firebase-collections-enum";
import { useCommonStore } from "../stores/common-store";
import { useUserStore } from "../stores/user-store";
import type { IFileInfo } from "../types/avatar-utility-types";
import type { UserVMRegWithEmailAndPassword } from "../types/userVm-types";
import { nameUser } from "../types/userVm-types";

const rulesMap = new Map<string, RuleExpression<unknown>>([
  ["name", "required|min:4"],
  [
    "username",
    {
      required: true,
      min: 2,
      unique: {
        coll: FabCollection.users,
        field: nameUser("username"),
      },
    },
  ],
  [
    "email",
    {
      required: true,
      email: true,
      unique: [FabCollection.users, nameUser("email")],
    },
  ],
  ["password", { required: true, min: [6] }],
]);

const commonStore = useCommonStore();
const userStore = useUserStore();

const router = useRouter();

const isPickerRevealed = ref(false);

const userSelectedAvatarFileData = ref<IFileInfo | undefined>();

const editorObj = reactive({} as UserVMRegWithEmailAndPassword);

async function register() {
  editorObj.avatarFile = userSelectedAvatarFileData.value?.file;
  await userStore.registerUserWithEmailAndPassword(editorObj);
  goToProfileEdit();
}

async function registerWithGoogle() {
  await userStore.signInWithGoogle();
  goToProfileEdit();
}

function goToProfileEdit() {
  router.push({ name: "ProfileEdit" });
}

function storeFileDateToState(dto: IFileInfo) {
  userSelectedAvatarFileData.value = dto;
}

function toggleButtonAndPicker() {
  isPickerRevealed.value = !isPickerRevealed.value;
}

commonStore.setReady();
</script>

<template>
  <div class="flex-grid justify-center">
    <div class="col-2">
      <vee-form class="card card-form" @submit.prevent="register">
        <h1 class="text-center">Register</h1>

        <app-form-field
          v-model="editorObj.name"
          name="name"
          type="text"
          :rules="rulesMap.get('name')"
          label="Full Name"
        />

        <app-form-field
          v-model="editorObj.username"
          type="text"
          name="username"
          label="Username"
          :rules="rulesMap.get('username')"
        />

        <app-form-field
          v-model="editorObj.email"
          name="email"
          type="email"
          :rules="rulesMap.get('email')"
          label="Email"
        />

        <app-form-field
          v-model="editorObj.password"
          name="password"
          type="password"
          :rules="rulesMap.get('password')"
          label="Password"
        />

        <div class="form-group">
          <label for="avatar">Avatar</label>

          <button
            v-show="!isPickerRevealed"
            id="avatar"
            class="form-input btn-small"
            type="button"
            @click.prevent="toggleButtonAndPicker"
          >
            Choose
          </button>

          <template v-if="isPickerRevealed">
            <avatar-file-picker
              :avatar-src="userSelectedAvatarFileData?.objUrl"
              @img-loaded="commonStore.setLoading(false)"
              @file-picked="storeFileDateToState"
            />

            <avatar-random-picker
              :disabled="commonStore.isLoading"
              @file-picked="storeFileDateToState"
              @start="commonStore.setLoading"
            />
          </template>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-blue btn-block">Register</button>
        </div>
      </vee-form>

      <div class="text-center push-top">
        <button class="btn-red btn-xsmall" @click="registerWithGoogle">
          <i class="fa fa-google fa-btn"></i>Sign up with Google
        </button>
      </div>
    </div>
  </div>
</template>
