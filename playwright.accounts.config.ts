import { defineConfig } from '@playwright/test';
import os from 'node:os';
export const mail = `/tmp/homes-consumer-browser-${os.userInfo().uid}`;
export default defineConfig({testDir:'./e2e',testMatch:'accounts.spec.ts',workers:1,timeout:60000,use:{baseURL:'http://127.0.0.1:3101',channel:'chrome',trace:'retain-on-failure'},webServer:[
 {command:'MONGOMS_DISTRO=ubuntu-22.04 node ../dnbhomesbackend/scripts/local-consumer-qa.js',url:'http://127.0.0.1:3100/api/v1/properties',reuseExistingServer:false,env:{CONSUMER_MAIL_LOCAL_PATH:mail}},
 {command:'npm start -- -p 3101',url:'http://127.0.0.1:3101',reuseExistingServer:false,env:{HOMES_BUILD_PROFILE:'local',NEXT_PUBLIC_API_BASE_URL:'http://127.0.0.1:3100/api/v1',NEXT_PUBLIC_SITE_URL:'http://127.0.0.1:3101'}}
]});
