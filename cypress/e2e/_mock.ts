import { UserPaginationList } from '../../src/ui/pages/usersList/types'

/* Copyright (c) 2022, VRAI Labs and/or its affiliates. All rights reserved.
 *
 * This software is licensed under the Apache License, Version 2.0 (the
 * "License") as published by the Apache Software Foundation.
 *
 * You may not use this file except in compliance with the License. You may
 * obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

export const userListResponse: UserPaginationList = {
  status: 'OK',
  users: [
    {
      recipeId: 'thirdparty',
      user: {
        // first row should give truncated texts
        firstName: 'assddsdfnicolas.zherebtsodadasdsaddfsfsdfv',
        lastName: 'assddsdfnicolas.zherebtsodadasdsaddfsfsdfv',
        thirdParty: {
          id: 'emailFromFastmail.comWithLongText',
          userId: 'assddsdfnicolas.zherebtsodadasdsaddfsfsdfv@gmail.com',
        },
        email: 'assddsdfnicolas.zherebtsodadasdsaddfsfsdfv@gmail.com',
        id: 'b0b60cc2-569c-42f1-8726-f1fc22ea5e47',
        timeJoined: 1661163314666,
      },
    },
    {
      recipeId: 'emailpassword',
      user: {
        email: 'andreas.ronning@cobhamsatcom.com',
        id: '319f82dc-8119-4d4e-a581-ac3fd88781bd',
        timeJoined: 1661159994087,
      },
    },
    {
      recipeId: 'emailpassword',
      user: { email: 'test@test.com', id: '02cace21-e0b7-41b1-950b-3eeedee1dcfa', timeJoined: 1661159945610 },
    },
    {
      recipeId: 'emailpassword',
      user: { email: 'cbcb@sfca.org', id: '0b647b51-2e7f-4412-be6b-6e3a8bfe4894', timeJoined: 1661157977272 },
    },
    {
      recipeId: 'thirdparty',
      user: {
        email: 'gritty.key5137@fastmail.com',
        id: '464ef8eb-c1c6-4d0e-b53e-0103ce595744',
        timeJoined: 1661152905324,
        thirdParty: {
          id: 'emailFromFastmail.comWithLongText',
          userId: 'gritty.key5137@fastmail.com',
        },
      },
    },
    {
      recipeId: 'emailpassword',
      user: { email: '123@123.com', id: '8aa7ff93-6ec7-44ea-a8e6-26c114b6b2b1', timeJoined: 1661150594660 },
    },
    {
      recipeId: 'thirdparty',
      user: {
        thirdParty: { id: 'google', userId: '111502266100758122657' },
        email: 'david.leangen@gmail.com',
        id: '163bdc52-da4d-4d94-a994-b1752fe1780c',
        timeJoined: 1661146704514,
      },
    },
    {
      recipeId: 'passwordless',
      user: {
        phoneNumber: '+36704535785',
        id: '9079f50b-d1ab-44dd-936a-82b2ac36ecc1',
        timeJoined: 1661121413862,
      },
    },
    {
      recipeId: 'emailpassword',
      user: {
        email: 'porcellus+test2@gmail.com',
        id: 'ab6b074b-c98a-4bab-99f7-ceb2f5de9809',
        timeJoined: 1661121375923,
      },
    },
    {
      recipeId: 'thirdparty',
      user: {
        thirdParty: { id: 'google', userId: '112355194610083389638' },
        email: 'ubirajaramneto@gmail.com',
        id: '35ebb3c6-c222-49e0-aa21-b96cb6a6e0f9',
        timeJoined: 1661118293437,
      },
    },
  ],
  nextPaginationToken: 'ZjgwYzNiOGYtMjdhMS00MjIwLWFkMzAtYjY4NTBjYTMxMGVlOzE2NjExMTU0Mzk5MDg=',
}
