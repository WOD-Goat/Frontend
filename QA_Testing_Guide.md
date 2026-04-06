# WODGoat — QA Testing Guide

**Version:** 1.0  
**Date:** 2026-04-04  
**Platform:** iOS & Android  

---

## Table of Contents

1. [App Overview](#1-app-overview)
2. [Test Environment Setup](#2-test-environment-setup)
3. [Feature Test Cases](#3-feature-test-cases)
4. [Subscription & Paywall Testing](#4-subscription--paywall-testing)
5. [Navigation & UI Testing](#5-navigation--ui-testing)
6. [Edge Cases & Negative Testing](#6-edge-cases--negative-testing)
7. [Bug Report Template](#7-bug-report-template)
8. [Developer Attention Required](#8-developer-attention-required)

---

## 1. App Overview

### What the App Does

WODGoat is a CrossFit/functional-fitness tracking app. Users log workouts (WODs), track personal records (PRs), join coach-led training groups, and use a built-in interval timer. Workouts can be created manually or via AI voice input. Coaches can create groups, assign workouts to athletes, and view leaderboards.

### User Types

| User Type | Description |
|-----------|-------------|
| **Athlete (Free)** | A registered user on the free plan. Limited group joins and voice workout usage. |
| **Athlete Pro** | Paid athlete. Unlimited groups, PR stickers, custom timer intervals, more voice input. |
| **Coach Pro** | Paid coach. Everything in Athlete Pro plus group creation and leaderboard access. |

### Subscription Tiers

| Feature | Athlete Free | Athlete Pro | Coach Pro |
|---------|-------------|-------------|-----------|
| Voice workouts per month | 5 | Unlimited | Unlimited |
| Voice input max duration | 45 sec | 60 sec | 90 sec |
| Join groups | 1 max | Unlimited | Unlimited |
| Create groups | No | No | Yes |
| Leaderboard access | No | No | Yes |
| PR Share Sticker | No | Yes | Yes |
| Custom timer intervals | No | Yes | Yes |

---

## 2. Test Environment Setup

### 2.1 Installing the App

**iOS (TestFlight):**
1. Install the TestFlight app from the App Store on your iPhone.
2. Open the TestFlight invite link provided by the development team.
3. Tap **Accept** → **Install** → **Open**.

**Android (Google Play Closed Testing):**
1. Open the Google Play invite link provided by the development team.
2. Tap **Join the programme** → **Download**.
3. Install the APK or update via Play Store.

### 2.4 Prerequisites per Test Run

- [ ] App installed and up-to-date from TestFlight / Play closed testing
- [ ] Airplane mode toggle accessible for offline tests
- [ ] Screen recording enabled (for capturing bugs)
- [ ] At least one other test account available to create a group and share codes

---

## 3. Feature Test Cases

> **Format:** Each test case includes a Test ID, Feature Area, Steps, Expected Result, and a Pass/Fail field.  
> Mark **P** (Pass), **F** (Fail), or **N/A** in the Pass/Fail column.

---

### 3.1 Onboarding & Authentication

#### TC-AUTH-001
| Field | Detail |
|-------|--------|
| **Test ID** | TC-AUTH-001 |
| **Feature Area** | Onboarding |
| **Steps** | 1. Launch app fresh (first install or after clearing data). 2. Observe the welcome screen. |
| **Expected Result** | Onboarding carousel displays with 3 slides. Slide 1: "Meet WODGoat". Slide 2: "Smart WOD Tracking". Slide 3: "AI Guidance Anytime". Pagination dots update as you swipe. |
| **Pass/Fail** | |

#### TC-AUTH-002
| Field | Detail |
|-------|--------|
| **Test ID** | TC-AUTH-002 |
| **Feature Area** | Onboarding |
| **Steps** | 1. Swipe through all 3 onboarding slides. 2. On slide 3, tap **Get Started**. |
| **Expected Result** | App navigates to the Login screen. |
| **Pass/Fail** | |

#### TC-AUTH-003
| Field | Detail |
|-------|--------|
| **Test ID** | TC-AUTH-003 |
| **Feature Area** | Sign Up |
| **Steps** | 1. On the Login screen, tap **Sign Up**. 2. Enter a valid new email address. 3. Enter a password of 8+ characters. 4. Enter the same password in Confirm Password. 5. Tap **Sign Up**. |
| **Expected Result** | App navigates to the email verification screen. A verification code email is sent to the entered address. |
| **Pass/Fail** | |

#### TC-AUTH-004
| Field | Detail |
|-------|--------|
| **Test ID** | TC-AUTH-004 |
| **Feature Area** | Sign Up — Password Validation |
| **Steps** | 1. On Sign Up screen, enter a password of only 7 characters. 2. Tap **Sign Up**. |
| **Expected Result** | An inline error message appears under the password field stating the minimum length requirement. The form does not submit. |
| **Pass/Fail** | |

#### TC-AUTH-005
| Field | Detail |
|-------|--------|
| **Test ID** | TC-AUTH-005 |
| **Feature Area** | Sign Up — Confirm Password Mismatch |
| **Steps** | 1. On Sign Up screen, enter a valid password. 2. Enter a different value in Confirm Password. 3. Tap **Sign Up**. |
| **Expected Result** | An inline error appears stating passwords do not match. Form does not submit. |
| **Pass/Fail** | |

#### TC-AUTH-006
| Field | Detail |
|-------|--------|
| **Test ID** | TC-AUTH-006 |
| **Feature Area** | Email Verification |
| **Steps** | 1. After sign-up, open the verification email. 2. Enter the code on the Verify screen. 3. Tap **Verify**. |
| **Expected Result** | Verification succeeds. App navigates to the main app (Workouts tab). |
| **Pass/Fail** | |

#### TC-AUTH-007
| Field | Detail |
|-------|--------|
| **Test ID** | TC-AUTH-007 |
| **Feature Area** | Email Verification — Resend |
| **Steps** | 1. On the Verify screen, tap **Resend code** without entering a code. |
| **Expected Result** | A new verification code is sent to the email address. A confirmation/toast is shown. |
| **Pass/Fail** | |

#### TC-AUTH-008
| Field | Detail |
|-------|--------|
| **Test ID** | TC-AUTH-008 |
| **Feature Area** | Login |
| **Steps** | 1. On Login screen, enter valid email and password for an existing account. 2. Tap **Login**. |
| **Expected Result** | Login succeeds. App navigates to the Workouts tab. Notification permission prompt may appear. |
| **Pass/Fail** | |

#### TC-AUTH-009
| Field | Detail |
|-------|--------|
| **Test ID** | TC-AUTH-009 |
| **Feature Area** | Login — Wrong Password |
| **Steps** | 1. On Login screen, enter valid email with wrong password. 2. Tap **Login**. |
| **Expected Result** | An error message is shown (e.g., "Invalid credentials"). User remains on Login screen. |
| **Pass/Fail** | |

#### TC-AUTH-010
| Field | Detail |
|-------|--------|
| **Test ID** | TC-AUTH-010 |
| **Feature Area** | Forgot Password |
| **Steps** | 1. On Login screen, tap **Forgot Password?**. 2. Enter a valid registered email. 3. Tap the send button. |
| **Expected Result** | App navigates to the "Sent" confirmation screen indicating an email was sent. |
| **Pass/Fail** | |

#### TC-AUTH-011
| Field | Detail |
|-------|--------|
| **Test ID** | TC-AUTH-011 |
| **Feature Area** | Logout |
| **Steps** | 1. Log in with any account. 2. Go to Profile tab. 3. Scroll to the bottom. 4. Tap **Logout**. |
| **Expected Result** | Session is cleared. App returns to the Login/Onboarding screen. |
| **Pass/Fail** | |

---

### 3.2 Workouts

#### TC-WOD-001
| Field | Detail |
|-------|--------|
| **Test ID** | TC-WOD-001 |
| **Feature Area** | Workouts — List |
| **Steps** | 1. Log in with any account. 2. Tap the **Workouts** tab. |
| **Expected Result** | Workout list loads with filter pills: All, Upcoming, Done, Missed. Stats showing workout counts are visible. |
| **Pass/Fail** | |

#### TC-WOD-002
| Field | Detail |
|-------|--------|
| **Test ID** | TC-WOD-002 |
| **Feature Area** | Workouts — Empty State |
| **Steps** | 1. Log in with a fresh account that has no workouts. 2. Tap the **Workouts** tab. |
| **Expected Result** | An empty state is shown with onboarding text ("Your training starts here" or similar). The floating + button is visible. |
| **Pass/Fail** | |

#### TC-WOD-003
| Field | Detail |
|-------|--------|
| **Test ID** | TC-WOD-003 |
| **Feature Area** | Workouts — Filter Pills |
| **Steps** | 1. From the Workouts tab with workouts present, tap each filter pill: **Upcoming**, **Done**, **Missed**, **All**. |
| **Expected Result** | The list updates to show only workouts matching the selected filter. Tapping **All** shows every workout. |
| **Pass/Fail** | |

#### TC-WOD-004
| Field | Detail |
|-------|--------|
| **Test ID** | TC-WOD-004 |
| **Feature Area** | Workouts — Pagination |
| **Steps** | 1. Log in with an account that has more than 7 workouts. 2. Scroll to the bottom of the Workouts list. 3. Tap **Load More**. |
| **Expected Result** | Additional workouts load and append to the list. |
| **Pass/Fail** | |

#### TC-WOD-005
| Field | Detail |
|-------|--------|
| **Test ID** | TC-WOD-005 |
| **Feature Area** | Create Workout — Manual (Structured) |
| **Steps** | 1. Tap the **+** FAB on the Workouts tab. 2. On Create Workout screen, enter a title. 3. Set a scheduled date. 4. Add a note. 5. Ensure **Structured** mode is selected. 6. Tap **Add WOD**. 7. In the WOD, tap **Add Exercise**. 8. Type an exercise name and select it. 9. Fill in instructions. 10. Tap **Save**. |
| **Expected Result** | Workout is created and appears in the Workouts list. |
| **Pass/Fail** | |

#### TC-WOD-006
| Field | Detail |
|-------|--------|
| **Test ID** | TC-WOD-006 |
| **Feature Area** | Create Workout — Free Text Mode |
| **Steps** | 1. Tap the **+** FAB. 2. Toggle mode to **Free Text**. 3. Type a workout description. 4. Tap **Save**. |
| **Expected Result** | Workout is saved as free text and appears in the list. |
| **Pass/Fail** | |

#### TC-WOD-007
| Field | Detail |
|-------|--------|
| **Test ID** | TC-WOD-007 |
| **Feature Area** | Create Workout — Voice Input (Free tier, within limit) |
| **Steps** | 1. Log in as a Free tier user with fewer than 5 voice workouts used this month. 2. Tap **+** FAB → Create Workout. 3. Tap the voice input button. 4. Speak a workout description (under 45 seconds). 5. Stop recording. |
| **Expected Result** | The voice is processed by the AI. Parsed workout fields (title, exercises, instructions) are populated in the form. |
| **Pass/Fail** | |

#### TC-WOD-008
| Field | Detail |
|-------|--------|
| **Test ID** | TC-WOD-008 |
| **Feature Area** | Create Workout — Voice Input Limit (Free Tier) |
| **Steps** | 1. Log in as a Free tier user who has already used 5 voice workouts this month. 2. Tap **+** FAB → Create Workout. 3. Tap the voice input button. |
| **Expected Result** | The paywall screen appears because the monthly voice limit has been reached. |
| **Pass/Fail** | |

#### TC-WOD-009
| Field | Detail |
|-------|--------|
| **Test ID** | TC-WOD-009 |
| **Feature Area** | Workout Details — View |
| **Steps** | 1. From the Workouts list, tap on any workout. |
| **Expected Result** | Workout details screen opens showing the title, scheduled date, notes, and all WODs/exercises with instructions. |
| **Pass/Fail** | |

#### TC-WOD-010
| Field | Detail |
|-------|--------|
| **Test ID** | TC-WOD-010 |
| **Feature Area** | Workout Details — Edit |
| **Steps** | 1. Open a workout that has not been completed. 2. Tap the edit button. 3. Change the title. 4. Save changes. |
| **Expected Result** | The updated title is saved and reflected on the details screen and in the list. |
| **Pass/Fail** | |

#### TC-WOD-011
| Field | Detail |
|-------|--------|
| **Test ID** | TC-WOD-011 |
| **Feature Area** | Workout Details — Delete |
| **Steps** | 1. Open any workout. 2. Tap the **Delete** button. 3. Confirm the deletion when prompted. |
| **Expected Result** | The workout is deleted. App navigates back to the Workouts list. The deleted workout no longer appears. |
| **Pass/Fail** | |

#### TC-WOD-012
| Field | Detail |
|-------|--------|
| **Test ID** | TC-WOD-012 |
| **Feature Area** | Complete Workout & Log Results |
| **Steps** | 1. Open an uncompleted workout. 2. Tap **Complete Workout**. 3. On the results screen, fill in results for each exercise (reps, weight, time, etc.). 4. Tap **Submit**. |
| **Expected Result** | Results are saved. The workout is marked as Done and shows the "Completed" badge. If a new PR was set, it is recorded. |
| **Pass/Fail** | |

---

### 3.3 Personal Records (PRs)

#### TC-PR-001
| Field | Detail |
|-------|--------|
| **Test ID** | TC-PR-001 |
| **Feature Area** | PRs — List |
| **Steps** | 1. Tap the **PRs** tab. |
| **Expected Result** | PRs list loads with a search bar at the top, a stats row (Total PRs, Improved, Latest), and a hero card showing the most recent PR. |
| **Pass/Fail** | |

#### TC-PR-002
| Field | Detail |
|-------|--------|
| **Test ID** | TC-PR-002 |
| **Feature Area** | PRs — Empty State |
| **Steps** | 1. Log in with an account that has no PRs. 2. Tap the **PRs** tab. |
| **Expected Result** | An empty state is shown with onboarding text. The floating + button is visible. |
| **Pass/Fail** | |

#### TC-PR-003
| Field | Detail |
|-------|--------|
| **Test ID** | TC-PR-003 |
| **Feature Area** | PRs — Search |
| **Steps** | 1. On the PRs tab, tap the search input. 2. Type part of an exercise name (e.g., "dead" for "Deadlift"). |
| **Expected Result** | The list filters to show only PRs matching the search term. |
| **Pass/Fail** | |

#### TC-PR-004
| Field | Detail |
|-------|--------|
| **Test ID** | TC-PR-004 |
| **Feature Area** | Create PR — Weight & Reps |
| **Steps** | 1. Tap the **+** FAB on the PRs tab. 2. Search for and select an exercise tracked by weight & reps (e.g., "Deadlift"). 3. Enter a weight and rep count. 4. Select today's date. 5. Tap **Save**. |
| **Expected Result** | PR is created. An estimated 1RM is calculated and shown (Epley formula). PR appears in the list. |
| **Pass/Fail** | |

#### TC-PR-005
| Field | Detail |
|-------|--------|
| **Test ID** | TC-PR-005 |
| **Feature Area** | Create PR — Time-based |
| **Steps** | 1. Tap the **+** FAB. 2. Select a time-based exercise (e.g., "500m Row"). 3. Enter a time in seconds. 4. Tap **Save**. |
| **Expected Result** | PR is saved with time displayed correctly. |
| **Pass/Fail** | |

#### TC-PR-006
| Field | Detail |
|-------|--------|
| **Test ID** | TC-PR-006 |
| **Feature Area** | PR Detail — History & Improvements |
| **Steps** | 1. Tap any PR in the list. 2. Create a second PR for the same exercise with a better value. 3. Navigate back to the list and tap that exercise again. |
| **Expected Result** | PR detail screen shows the full history of attempts with the best value highlighted. An improvement badge shows the delta from the previous best. |
| **Pass/Fail** | |

#### TC-PR-007
| Field | Detail |
|-------|--------|
| **Test ID** | TC-PR-007 |
| **Feature Area** | PR Share Sticker — Feature Gate |
| **Steps** | 1. Log in as a Free tier user. 2. Open a PR detail screen. 3. Attempt to tap the share/sticker button. |
| **Expected Result** | The paywall screen appears — this feature requires Athlete Pro or Coach Pro. |
| **Pass/Fail** | |

#### TC-PR-008
| Field | Detail |
|-------|--------|
| **Test ID** | TC-PR-008 |
| **Feature Area** | PR Share Sticker — Athlete Pro |
| **Steps** | 1. Log in as an Athlete Pro user. 2. Open a PR detail screen. 3. Tap the share/sticker button. |
| **Expected Result** | A share sticker or share sheet is presented. No paywall is shown. |
| **Pass/Fail** | |

---

### 3.4 Groups

#### TC-GRP-001
| Field | Detail |
|-------|--------|
| **Test ID** | TC-GRP-001 |
| **Feature Area** | Groups — List |
| **Steps** | 1. Tap the **Groups** tab. |
| **Expected Result** | Groups list loads with filter pills: All, Admin, Member. Shows any groups the user has created (Admin) and joined (Member). |
| **Pass/Fail** | |

#### TC-GRP-002
| Field | Detail |
|-------|--------|
| **Test ID** | TC-GRP-002 |
| **Feature Area** | Groups — Empty State |
| **Steps** | 1. Log in with a fresh account. 2. Tap the **Groups** tab. |
| **Expected Result** | An empty state is shown. The floating + button is visible. |
| **Pass/Fail** | |

#### TC-GRP-003
| Field | Detail |
|-------|--------|
| **Test ID** | TC-GRP-003 |
| **Feature Area** | Create Group — Feature Gate (Free Tier) |
| **Steps** | 1. Log in as a Free tier user. 2. Tap the **+** FAB on the Groups tab. |
| **Expected Result** | The paywall screen appears — creating groups requires Coach Pro. |
| **Pass/Fail** | |

#### TC-GRP-004
| Field | Detail |
|-------|--------|
| **Test ID** | TC-GRP-004 |
| **Feature Area** | Create Group — Feature Gate (Athlete Pro) |
| **Steps** | 1. Log in as an Athlete Pro user. 2. Tap the **+** FAB on the Groups tab. |
| **Expected Result** | The paywall screen appears — creating groups requires Coach Pro, not just Athlete Pro. |
| **Pass/Fail** | |

#### TC-GRP-005
| Field | Detail |
|-------|--------|
| **Test ID** | TC-GRP-005 |
| **Feature Area** | Create Group — Coach Pro |
| **Steps** | 1. Log in as a Coach Pro user. 2. Tap **+** FAB on Groups tab. 3. Enter a group name and description. 4. Tap **Create**. |
| **Expected Result** | Group is created with a unique 6-character code. It appears in the Groups list with an Admin badge. |
| **Pass/Fail** | |

#### TC-GRP-006
| Field | Detail |
|-------|--------|
| **Test ID** | TC-GRP-006 |
| **Feature Area** | Join Group — Within Free Limit |
| **Steps** | 1. Log in as a Free tier user with no groups joined. 2. Go to Groups tab. 3. Tap **Join Group** (or look for the join option). 4. Enter a valid 6-character group code. 5. Tap **Join**. |
| **Expected Result** | User successfully joins the group. It appears in the Groups list with a Member badge. |
| **Pass/Fail** | |

#### TC-GRP-007
| Field | Detail |
|-------|--------|
| **Test ID** | TC-GRP-007 |
| **Feature Area** | Join Group — Free Tier Limit Exceeded |
| **Steps** | 1. Log in as a Free tier user who is already a member of 1 group. 2. Attempt to join a second group using a valid code. |
| **Expected Result** | The paywall screen appears — the Free tier allows a maximum of 1 group. |
| **Pass/Fail** | |

#### TC-GRP-008
| Field | Detail |
|-------|--------|
| **Test ID** | TC-GRP-008 |
| **Feature Area** | Join Group — Invalid Code |
| **Steps** | 1. Go to Join Group screen. 2. Enter a 6-character code that does not correspond to any group. 3. Tap **Join**. |
| **Expected Result** | An error message is shown stating the group code is invalid or not found. |
| **Pass/Fail** | |

#### TC-GRP-009
| Field | Detail |
|-------|--------|
| **Test ID** | TC-GRP-009 |
| **Feature Area** | Join Group — Code Formatting |
| **Steps** | 1. Go to Join Group screen. 2. Type a group code in lowercase (e.g., "abc123"). |
| **Expected Result** | The input automatically converts letters to uppercase as you type. |
| **Pass/Fail** | |

#### TC-GRP-010
| Field | Detail |
|-------|--------|
| **Test ID** | TC-GRP-010 |
| **Feature Area** | Group Details |
| **Steps** | 1. Tap any group in the Groups list. |
| **Expected Result** | Group details screen opens showing: group name, description, member count, member list, and list of group workouts. |
| **Pass/Fail** | |

#### TC-GRP-011
| Field | Detail |
|-------|--------|
| **Test ID** | TC-GRP-011 |
| **Feature Area** | Group Workout — View & Submit Results |
| **Steps** | 1. As a group member, tap a group workout from the Group Details screen. 2. Review the workout details. 3. Tap the submit results button. 4. Fill in results for each exercise. 5. Tap **Submit**. |
| **Expected Result** | Results are submitted. The submit button is no longer shown (already submitted). |
| **Pass/Fail** | |

#### TC-GRP-012
| Field | Detail |
|-------|--------|
| **Test ID** | TC-GRP-012 |
| **Feature Area** | Group Workout — Leaderboard (Feature Gate) |
| **Steps** | 1. Log in as an Athlete Pro user. 2. Open a group workout that has submissions. 3. Tap the **Leaderboard** button. |
| **Expected Result** | The paywall screen appears — leaderboard access requires Coach Pro. |
| **Pass/Fail** | |

#### TC-GRP-013
| Field | Detail |
|-------|--------|
| **Test ID** | TC-GRP-013 |
| **Feature Area** | Group Workout — Leaderboard (Coach Pro) |
| **Steps** | 1. Log in as a Coach Pro user who administers a group. 2. Open a group workout with at least one submission. 3. Tap the **Leaderboard** button. |
| **Expected Result** | Leaderboard screen loads showing member rankings and scores. No paywall. |
| **Pass/Fail** | |

#### TC-GRP-014
| Field | Detail |
|-------|--------|
| **Test ID** | TC-GRP-014 |
| **Feature Area** | Create Group Workout (Coach Pro) |
| **Steps** | 1. Log in as a Coach Pro user. 2. Open one of your admin groups. 3. Tap the create workout button. 4. Fill in workout details. 5. Tap **Save**. |
| **Expected Result** | A workout is created and assigned to the group. It appears in the group's workout list. Members can see it. |
| **Pass/Fail** | |

---

### 3.5 WOD Timer

#### TC-TMR-001
| Field | Detail |
|-------|--------|
| **Test ID** | TC-TMR-001 |
| **Feature Area** | Timer — Setup Screen |
| **Steps** | 1. Tap the **Timer** tab. |
| **Expected Result** | Timer setup screen is shown with options to configure the timer. |
| **Pass/Fail** | |

#### TC-TMR-002
| Field | Detail |
|-------|--------|
| **Test ID** | TC-TMR-002 |
| **Feature Area** | Timer — Start |
| **Steps** | 1. On the Timer tab, tap the **+** FAB (or the start button). 2. Confirm when prompted. |
| **Expected Result** | The active timer screen slides up and the timer begins counting. |
| **Pass/Fail** | |

#### TC-TMR-003
| Field | Detail |
|-------|--------|
| **Test ID** | TC-TMR-003 |
| **Feature Area** | Timer — Active Screen (Full-Screen) |
| **Steps** | 1. Start the timer. 2. Try to swipe down or press the back button. |
| **Expected Result** | Back gesture is disabled on the active timer screen. The timer continues running. The user must use an explicit stop/end button. |
| **Pass/Fail** | |

#### TC-TMR-004
| Field | Detail |
|-------|--------|
| **Test ID** | TC-TMR-004 |
| **Feature Area** | Timer — Custom Intervals (Feature Gate, Free Tier) |
| **Steps** | 1. Log in as a Free tier user. 2. On the Timer setup screen, attempt to configure custom intervals. |
| **Expected Result** | The paywall screen appears — custom timer intervals require Athlete Pro or Coach Pro. |
| **Pass/Fail** | |

#### TC-TMR-005
| Field | Detail |
|-------|--------|
| **Test ID** | TC-TMR-005 |
| **Feature Area** | Timer — Custom Intervals (Athlete Pro) |
| **Steps** | 1. Log in as an Athlete Pro user. 2. On the Timer setup screen, configure custom intervals. 3. Start the timer. |
| **Expected Result** | Timer uses the custom intervals. Sound/haptics fire at each interval. No paywall. |
| **Pass/Fail** | |

---

### 3.6 Profile

#### TC-PRF-001
| Field | Detail |
|-------|--------|
| **Test ID** | TC-PRF-001 |
| **Feature Area** | Profile — Display |
| **Steps** | 1. Tap the **Profile** tab. |
| **Expected Result** | Profile screen shows: avatar, display name, nickname, streak, total completed workouts, best streak, latest PR highlight, account email, plan name, member since date. |
| **Pass/Fail** | |

#### TC-PRF-002
| Field | Detail |
|-------|--------|
| **Test ID** | TC-PRF-002 |
| **Feature Area** | Profile — Plan Display |
| **Steps** | 1. Log in as each of the three tier accounts (Free, Athlete Pro, Coach Pro). 2. Check the **Plan** field on the Profile screen for each. |
| **Expected Result** | Free account shows "Athlete Free" (or "Free"). Athlete Pro shows "Athlete Pro". Coach Pro shows "Coach Pro". |
| **Pass/Fail** | |

#### TC-PRF-003
| Field | Detail |
|-------|--------|
| **Test ID** | TC-PRF-003 |
| **Feature Area** | Profile — Upgrade Subscription |
| **Steps** | 1. Log in as a Free tier user. 2. On Profile, tap **Upgrade** or the subscription management button. |
| **Expected Result** | The paywall screen is presented showing available plans. |
| **Pass/Fail** | |

#### TC-PRF-004
| Field | Detail |
|-------|--------|
| **Test ID** | TC-PRF-004 |
| **Feature Area** | Profile — Privacy Policy & Terms |
| **Steps** | 1. On the Profile screen, tap **Privacy Policy**. 2. Go back. 3. Tap **Terms of Service**. |
| **Expected Result** | Each link opens the corresponding web page in a browser or in-app web view. |
| **Pass/Fail** | |

#### TC-PRF-005
| Field | Detail |
|-------|--------|
| **Test ID** | TC-PRF-005 |
| **Feature Area** | Profile — Contact |
| **Steps** | 1. On the Profile screen, tap **Contact**. |
| **Expected Result** | The device's email client opens with the support address pre-filled, or a contact modal appears. |
| **Pass/Fail** | |

#### TC-PRF-006
| Field | Detail |
|-------|--------|
| **Test ID** | TC-PRF-006 |
| **Feature Area** | Profile — Delete Account |
| **Steps** | 1. On the Profile screen, tap **Delete Account**. 2. When prompted with a confirmation dialog, tap **Cancel**. |
| **Expected Result** | No action taken. User remains on the Profile screen. Account still exists. |
| **Pass/Fail** | |

#### TC-PRF-007
| Field | Detail |
|-------|--------|
| **Test ID** | TC-PRF-007 |
| **Feature Area** | Profile — Delete Account (Confirm) |
| **Steps** | 1. On the Profile screen, tap **Delete Account**. 2. Confirm deletion. |
| **Expected Result** | Account is deleted. User is logged out and returned to the Login/Onboarding screen. The account can no longer log in. |
| **Pass/Fail** | |

---

## 4. Subscription & Paywall Testing

### 4.1 Purchasing Subscriptions

#### TC-SUB-001
| Field | Detail |
|-------|--------|
| **Test ID** | TC-SUB-001 |
| **Feature Area** | Paywall — Display |
| **Steps** | 1. Trigger the paywall from any feature gate (e.g., tap + FAB on Groups as a Free user). |
| **Expected Result** | Full-screen paywall is displayed showing subscription options (Athlete Pro monthly, Athlete Pro annual, Coach Pro monthly, Coach Pro annual) with pricing. |
| **Pass/Fail** | |

#### TC-SUB-002
| Field | Detail |
|-------|--------|
| **Test ID** | TC-SUB-002 |
| **Feature Area** | Purchase Athlete Pro Monthly |
| **Steps** | 1. Open the paywall. 2. Select **Athlete Pro Monthly**. 3. Complete the sandbox purchase flow. |
| **Expected Result** | Purchase completes successfully. App returns to the previous screen. Profile now shows "Athlete Pro". PR sticker and custom timer are now unlocked. |
| **Pass/Fail** | |

#### TC-SUB-003
| Field | Detail |
|-------|--------|
| **Test ID** | TC-SUB-003 |
| **Feature Area** | Purchase Athlete Pro Annual |
| **Steps** | 1. Open the paywall. 2. Select **Athlete Pro Annual**. 3. Complete the sandbox purchase flow. |
| **Expected Result** | Purchase completes. User is granted Athlete Pro entitlements. Annual pricing (lower per-month cost) is reflected. |
| **Pass/Fail** | |

#### TC-SUB-004
| Field | Detail |
|-------|--------|
| **Test ID** | TC-SUB-004 |
| **Feature Area** | Purchase Coach Pro Monthly |
| **Steps** | 1. Open the paywall as a Free tier user. 2. Select **Coach Pro Monthly**. 3. Complete the sandbox purchase flow. |
| **Expected Result** | Purchase completes. Profile shows "Coach Pro". Create Group and Leaderboard features are now accessible. |
| **Pass/Fail** | |

#### TC-SUB-005
| Field | Detail |
|-------|--------|
| **Test ID** | TC-SUB-005 |
| **Feature Area** | Purchase Coach Pro Annual |
| **Steps** | 1. Open the paywall. 2. Select **Coach Pro Annual**. 3. Complete the sandbox purchase flow. |
| **Expected Result** | Purchase completes. Coach Pro entitlements granted. |
| **Pass/Fail** | |

### 4.2 Upgrading & Downgrading

#### TC-SUB-006
| Field | Detail |
|-------|--------|
| **Test ID** | TC-SUB-006 |
| **Feature Area** | Upgrade — Athlete Pro → Coach Pro |
| **Steps** | 1. Log in as an Athlete Pro subscriber. 2. Open the paywall from Profile → Upgrade/Manage. 3. Select **Coach Pro Monthly**. 4. Complete the purchase. |
| **Expected Result** | User is upgraded to Coach Pro. Create Group button is now accessible. Leaderboard is now accessible. Profile shows "Coach Pro". |
| **Pass/Fail** | |

#### TC-SUB-007
| Field | Detail |
|-------|--------|
| **Test ID** | TC-SUB-007 |
| **Feature Area** | Downgrade — Coach Pro → Athlete Pro |
| **Steps** | 1. As a Coach Pro subscriber, cancel the Coach Pro subscription via App Store / Google Play settings. 2. (In sandbox, subscription expires in ~5 minutes.) 3. Reopen the app after expiry. |
| **Expected Result** | User loses Coach Pro entitlements. Create Group button shows paywall. Leaderboard shows paywall. Profile shows reduced plan. Created groups remain but new group creation is blocked. |
| **Pass/Fail** | |

#### TC-SUB-008
| Field | Detail |
|-------|--------|
| **Test ID** | TC-SUB-008 |
| **Feature Area** | Expired Subscription |
| **Steps** | 1. Subscribe to any paid plan in sandbox. 2. Wait for the sandbox subscription to expire (~5 minutes for monthly). 3. Re-open the app without renewing. |
| **Expected Result** | App detects the expired subscription. Paid features become locked again (paywall shown). Profile shows Free plan. App does not crash. |
| **Pass/Fail** | |

### 4.3 Restoring Purchases

#### TC-SUB-009
| Field | Detail |
|-------|--------|
| **Test ID** | TC-SUB-009 |
| **Feature Area** | Restore Purchases — From Paywall |
| **Steps** | 1. Log in as a user who has a prior active subscription on a different device or after reinstall. 2. Open the paywall. 3. Tap **Restore Purchases**. |
| **Expected Result** | Purchases are restored. The entitlements from the prior subscription are reinstated. Profile shows the correct paid plan. |
| **Pass/Fail** | |

#### TC-SUB-010
| Field | Detail |
|-------|--------|
| **Test ID** | TC-SUB-010 |
| **Feature Area** | Restore Purchases — Nothing to Restore |
| **Steps** | 1. Log in as a new user with no prior subscriptions. 2. Open the paywall. 3. Tap **Restore Purchases**. |
| **Expected Result** | An appropriate message is shown stating there are no purchases to restore. User remains on Free plan. |
| **Pass/Fail** | |

### 4.4 Content Locking Verification

#### TC-SUB-011
| Field | Detail |
|-------|--------|
| **Test ID** | TC-SUB-011 |
| **Feature Area** | Free Tier Content Locks — Full Verification |
| **Steps** | 1. Log in as a Free tier user. 2. Attempt each of the following: a) Tap + FAB on Groups tab. b) Join a second group after already being in one. c) Use voice input for the 6th time this month. d) Access leaderboard on any group workout. e) Tap PR share sticker. f) Access custom timer intervals. |
| **Expected Result** | ALL of the above actions trigger the paywall screen. None of them succeed without a subscription. |
| **Pass/Fail** | |

#### TC-SUB-012
| Field | Detail |
|-------|--------|
| **Test ID** | TC-SUB-012 |
| **Feature Area** | Athlete Pro Content Unlocks — Full Verification |
| **Steps** | 1. Log in as an Athlete Pro user. 2. Verify: a) Voice input works without limit (more than 5 times). b) Can join more than 1 group. c) PR share sticker is accessible. d) Custom timer intervals are accessible. 3. Verify these are STILL locked: e) Create group (should show paywall). f) Leaderboard (should show paywall). |
| **Expected Result** | Items a–d work without paywall. Items e–f show the paywall. |
| **Pass/Fail** | |

#### TC-SUB-013
| Field | Detail |
|-------|--------|
| **Test ID** | TC-SUB-013 |
| **Feature Area** | Coach Pro Content Unlocks — Full Verification |
| **Steps** | 1. Log in as a Coach Pro user. 2. Verify ALL features work without paywall: a) Create group. b) Join unlimited groups. c) Voice input (unlimited, 90 sec max). d) Leaderboard. e) PR share sticker. f) Custom timer intervals. |
| **Expected Result** | All features work without any paywall appearing. |
| **Pass/Fail** | |

### 4.5 Paywall Dismissal

#### TC-SUB-014
| Field | Detail |
|-------|--------|
| **Test ID** | TC-SUB-014 |
| **Feature Area** | Paywall — Dismiss Without Purchasing |
| **Steps** | 1. Trigger the paywall from any feature gate. 2. Tap the close/dismiss button or swipe to dismiss. |
| **Expected Result** | Paywall dismisses. User returns to the previous screen. No purchase is made. Feature remains locked. |
| **Pass/Fail** | |

#### TC-SUB-015
| Field | Detail |
|-------|--------|
| **Test ID** | TC-SUB-015 |
| **Feature Area** | Paywall — Cancelled Purchase |
| **Steps** | 1. Trigger the paywall. 2. Tap a plan to purchase. 3. Cancel the purchase flow at the OS-level payment sheet. |
| **Expected Result** | Paywall returns to the plan selection view. No charge is made. No error crash occurs. |
| **Pass/Fail** | |

---

## 5. Navigation & UI Testing

### 5.1 Tab Bar

#### TC-NAV-001
| Field | Detail |
|-------|--------|
| **Test ID** | TC-NAV-001 |
| **Feature Area** | Tab Bar — All Tabs |
| **Steps** | 1. After login, tap each of the 5 tab bar icons in order: Workouts, Groups, Timer, PRs, Profile. |
| **Expected Result** | Each tab navigates to the correct screen without errors. The active tab icon is highlighted. |
| **Pass/Fail** | |

#### TC-NAV-002
| Field | Detail |
|-------|--------|
| **Test ID** | TC-NAV-002 |
| **Feature Area** | Tab Bar — Floating + Button Visibility |
| **Steps** | 1. Tap each tab and note whether the floating + (FAB) button is visible: Workouts, Groups, Timer, PRs, Profile. |
| **Expected Result** | FAB is visible on: Workouts, Groups, Timer, PRs. FAB is NOT visible on: Profile. |
| **Pass/Fail** | |

#### TC-NAV-003
| Field | Detail |
|-------|--------|
| **Test ID** | TC-NAV-003 |
| **Feature Area** | Tab Bar — FAB Actions per Tab |
| **Steps** | 1. Tap FAB on Workouts tab. Note where it navigates. 2. Go back. Tap FAB on Groups tab (as Coach Pro). Note destination. 3. Go back. Tap FAB on Timer tab. Note action. 4. Go back. Tap FAB on PRs tab. Note destination. |
| **Expected Result** | Workouts FAB → Create Workout screen. Groups FAB → Create Group screen (or paywall). Timer FAB → Timer start confirmation. PRs FAB → Create PR screen. |
| **Pass/Fail** | |

#### TC-NAV-004
| Field | Detail |
|-------|--------|
| **Test ID** | TC-NAV-004 |
| **Feature Area** | Tab Bar — FAB Animation |
| **Steps** | 1. Switch between tabs that show and hide the FAB (e.g., PRs → Profile → PRs). 2. Observe the FAB animation. |
| **Expected Result** | FAB animates smoothly in and out (spring animation). Pulse ring loops while visible. |
| **Pass/Fail** | |

### 5.2 Screen Transitions

#### TC-NAV-005
| Field | Detail |
|-------|--------|
| **Test ID** | TC-NAV-005 |
| **Feature Area** | Navigation — Push Transitions |
| **Steps** | 1. From Workouts list, tap a workout → notes the push animation. 2. From Groups list, tap a group → notes the push animation. 3. From PRs list, tap a PR → notes the push animation. |
| **Expected Result** | All screens push from right to left with standard slide animation. Back navigation slides right to left back. |
| **Pass/Fail** | |

#### TC-NAV-006
| Field | Detail |
|-------|--------|
| **Test ID** | TC-NAV-006 |
| **Feature Area** | Navigation — Timer Active Screen Transition |
| **Steps** | 1. Start the timer from the Timer tab. 2. Observe the transition to the active timer screen. |
| **Expected Result** | Active timer slides up from the bottom (not a standard push). It covers the full screen including the tab bar. |
| **Pass/Fail** | |

#### TC-NAV-007
| Field | Detail |
|-------|--------|
| **Test ID** | TC-NAV-007 |
| **Feature Area** | Navigation — Paywall Modal |
| **Steps** | 1. Trigger the paywall from any feature gate. 2. Observe the transition. |
| **Expected Result** | Paywall presents as a full-screen modal (slides up from bottom). |
| **Pass/Fail** | |

#### TC-NAV-008
| Field | Detail |
|-------|--------|
| **Test ID** | TC-NAV-008 |
| **Feature Area** | Navigation — Back Button from Every Screen |
| **Steps** | 1. Navigate to each of the following screens and use the back button/gesture to return: Create Workout, Workout Details, Create PR, PR Details, Create Group, Join Group, Group Details, Group Workout, Timer Setup. |
| **Expected Result** | Every back navigation returns to the correct parent screen without crashes or incorrect state. |
| **Pass/Fail** | |

### 5.3 UI & Visual

#### TC-NAV-009
| Field | Detail |
|-------|--------|
| **Test ID** | TC-NAV-009 |
| **Feature Area** | UI — Frosted Glass Tab Bar |
| **Steps** | 1. Scroll a list (Workouts, PRs) so content moves behind the tab bar. |
| **Expected Result** | Tab bar has a frosted glass / blur effect. Content behind it is blurred but visible. |
| **Pass/Fail** | |

#### TC-NAV-010
| Field | Detail |
|-------|--------|
| **Test ID** | TC-NAV-010 |
| **Feature Area** | UI — App Version Check |
| **Steps** | 1. Install an older version of the app. 2. Launch it. |
| **Expected Result** | If below the minimum version, an update modal appears prompting the user to update. The modal blocks usage until the user updates. |
| **Pass/Fail** | |

#### TC-NAV-011
| Field | Detail |
|-------|--------|
| **Test ID** | TC-NAV-011 |
| **Feature Area** | UI — Notification Permission Prompt |
| **Steps** | 1. Log in for the first time on a device where notifications have not been approved yet. |
| **Expected Result** | The OS notification permission prompt appears. Regardless of the user's choice (Allow or Deny), the app continues to function without crashing. |
| **Pass/Fail** | |

---

## 6. Edge Cases & Negative Testing

### 6.1 Offline / No Internet

#### TC-EDGE-001
| Field | Detail |
|-------|--------|
| **Test ID** | TC-EDGE-001 |
| **Feature Area** | Offline — App Launch |
| **Steps** | 1. Enable Airplane mode. 2. Launch the app. |
| **Expected Result** | A "No Internet" overlay is shown. The app does not crash. Tapping a **Retry** button re-checks the connection. |
| **Pass/Fail** | |

#### TC-EDGE-002
| Field | Detail |
|-------|--------|
| **Test ID** | TC-EDGE-002 |
| **Feature Area** | Offline — Connection Lost Mid-Session |
| **Steps** | 1. Log in normally. 2. Navigate to the Workouts tab. 3. Enable Airplane mode. 4. Try to create a workout. |
| **Expected Result** | An appropriate error or "No Internet" overlay appears. The app does not crash. Data is not corrupted. |
| **Pass/Fail** | |

#### TC-EDGE-003
| Field | Detail |
|-------|--------|
| **Test ID** | TC-EDGE-003 |
| **Feature Area** | Offline — Reconnect |
| **Steps** | 1. With the "No Internet" overlay showing, disable Airplane mode (restore connection). 2. Tap **Retry** (if present) or wait. |
| **Expected Result** | App detects the restored connection and hides the overlay. Normal functionality resumes. |
| **Pass/Fail** | |

### 6.2 Invalid Inputs

#### TC-EDGE-004
| Field | Detail |
|-------|--------|
| **Test ID** | TC-EDGE-004 |
| **Feature Area** | Create Workout — Empty Title |
| **Steps** | 1. Open Create Workout. 2. Leave the title field empty. 3. Tap **Save**. |
| **Expected Result** | An error message appears under the title field. The form does not submit. |
| **Pass/Fail** | |

#### TC-EDGE-005
| Field | Detail |
|-------|--------|
| **Test ID** | TC-EDGE-005 |
| **Feature Area** | Create PR — Future Date |
| **Steps** | 1. Open Create PR. 2. Try to select a date in the future for the "Achieved On" field. |
| **Expected Result** | Future dates are disabled in the date picker. The maximum selectable date is today. |
| **Pass/Fail** | |

#### TC-EDGE-006
| Field | Detail |
|-------|--------|
| **Test ID** | TC-EDGE-006 |
| **Feature Area** | Join Group — Short Code |
| **Steps** | 1. Open Join Group. 2. Enter a code with fewer than 6 characters. 3. Tap **Join**. |
| **Expected Result** | An error is shown stating the code must be 6 characters. The request is not sent. |
| **Pass/Fail** | |

#### TC-EDGE-007
| Field | Detail |
|-------|--------|
| **Test ID** | TC-EDGE-007 |
| **Feature Area** | Login — Empty Fields |
| **Steps** | 1. On the Login screen, leave both email and password empty. 2. Tap **Login**. |
| **Expected Result** | Inline validation errors appear under each empty field. |
| **Pass/Fail** | |

#### TC-EDGE-008
| Field | Detail |
|-------|--------|
| **Test ID** | TC-EDGE-008 |
| **Feature Area** | Login — Invalid Email Format |
| **Steps** | 1. On Login screen, enter "notanemail" in the email field. 2. Tap **Login**. |
| **Expected Result** | An error message indicates the email format is invalid. |
| **Pass/Fail** | |

#### TC-EDGE-009
| Field | Detail |
|-------|--------|
| **Test ID** | TC-EDGE-009 |
| **Feature Area** | Create PR — Zero / Negative Value |
| **Steps** | 1. Open Create PR for a weight-based exercise. 2. Enter 0 for weight. 3. Tap **Save**. |
| **Expected Result** | An error message appears or the 0 value is rejected. A PR of 0 weight is not a valid record. |
| **Pass/Fail** | |

### 6.3 Empty States

#### TC-EDGE-010
| Field | Detail |
|-------|--------|
| **Test ID** | TC-EDGE-010 |
| **Feature Area** | Workouts — Empty State All Filters |
| **Steps** | 1. Log in with a fresh account. 2. Tap each filter pill on the Workouts tab (Upcoming, Done, Missed, All). |
| **Expected Result** | An empty state is shown for each filter with an appropriate message or illustration. No crashes or blank screens. |
| **Pass/Fail** | |

#### TC-EDGE-011
| Field | Detail |
|-------|--------|
| **Test ID** | TC-EDGE-011 |
| **Feature Area** | Groups — Empty State |
| **Steps** | 1. Log in with a fresh account. 2. Tap the Groups tab. 3. Try each filter (All, Admin, Member). |
| **Expected Result** | Empty state shown for each filter. No crash. |
| **Pass/Fail** | |

#### TC-EDGE-012
| Field | Detail |
|-------|--------|
| **Test ID** | TC-EDGE-012 |
| **Feature Area** | PRs — Empty Search |
| **Steps** | 1. On the PRs tab, type a search term that matches no exercises (e.g., "xyzabc"). |
| **Expected Result** | An empty state or "no results" message is shown. No crash. |
| **Pass/Fail** | |

### 6.4 Navigation — Back Gestures

#### TC-EDGE-013
| Field | Detail |
|-------|--------|
| **Test ID** | TC-EDGE-013 |
| **Feature Area** | Back Navigation — Mid-Form |
| **Steps** | 1. Open Create Workout. 2. Fill in a title and add an exercise. 3. Press the back button before saving. |
| **Expected Result** | A confirmation dialog warns that unsaved changes will be lost, OR the app navigates back with changes discarded. No partial data is saved. |
| **Pass/Fail** | |

#### TC-EDGE-014
| Field | Detail |
|-------|--------|
| **Test ID** | TC-EDGE-014 |
| **Feature Area** | Back Navigation — From Paywall |
| **Steps** | 1. Trigger the paywall. 2. Press the back button or swipe down. |
| **Expected Result** | Paywall closes. User is returned to the screen that triggered it. No crash. Feature remains locked. |
| **Pass/Fail** | |

### 6.5 Rapid Tapping

#### TC-EDGE-015
| Field | Detail |
|-------|--------|
| **Test ID** | TC-EDGE-015 |
| **Feature Area** | Rapid Tapping — Save Buttons |
| **Steps** | 1. Fill in a valid Create Workout form. 2. Rapidly tap the **Save** button multiple times. |
| **Expected Result** | Only one workout is created. The button is disabled or debounced after the first tap. |
| **Pass/Fail** | |

#### TC-EDGE-016
| Field | Detail |
|-------|--------|
| **Test ID** | TC-EDGE-016 |
| **Feature Area** | Rapid Tapping — FAB |
| **Steps** | 1. Rapidly tap the floating + button multiple times. |
| **Expected Result** | Only one navigation event occurs. No duplicate screens are pushed to the stack. |
| **Pass/Fail** | |

#### TC-EDGE-017
| Field | Detail |
|-------|--------|
| **Test ID** | TC-EDGE-017 |
| **Feature Area** | Rapid Tapping — Login Button |
| **Steps** | 1. Fill in valid login credentials. 2. Rapidly tap **Login** multiple times. |
| **Expected Result** | Only one login request is made. No duplicate auth calls or errors. |
| **Pass/Fail** | |

### 6.6 Permissions

#### TC-EDGE-018
| Field | Detail |
|-------|--------|
| **Test ID** | TC-EDGE-018 |
| **Feature Area** | Notifications — Denied |
| **Steps** | 1. Install app fresh. 2. When the notification permission prompt appears, tap **Don't Allow** (iOS) or **Deny** (Android). 3. Continue using the app. |
| **Expected Result** | App continues normally. No crash. Notifications simply won't be received. No repeated prompts (OS handles re-asking). |
| **Pass/Fail** | |

#### TC-EDGE-019
| Field | Detail |
|-------|--------|
| **Test ID** | TC-EDGE-019 |
| **Feature Area** | Microphone — Voice Input Permission |
| **Steps** | 1. On Create Workout, tap the voice input button for the first time. 2. When the microphone permission prompt appears, tap **Deny**. |
| **Expected Result** | App shows an error or informational message that microphone access is required for voice input. No crash. |
| **Pass/Fail** | |

#### TC-EDGE-020
| Field | Detail |
|-------|--------|
| **Test ID** | TC-EDGE-020 |
| **Feature Area** | Microphone — Voice Input After Grant |
| **Steps** | 1. Go to device Settings and grant microphone permission to WODGoat. 2. Return to the app. 3. Open Create Workout and use voice input. |
| **Expected Result** | Voice input works correctly after permission is granted. |
| **Pass/Fail** | |

---

## 7. Bug Report Template

Copy and fill this template for every bug found during testing.

---

```
BUG REPORT
══════════════════════════════════════

Bug ID:        [BUG-XXXX — assign sequential number]
Date Found:    [YYYY-MM-DD]
Tester Name:   [Your name]
App Version:   [Found in Profile → About or TestFlight]
Device:        [e.g., iPhone 15 Pro, iOS 17.4 | Pixel 7, Android 14]
Build Type:    [TestFlight / Google Play Closed Testing]

──────────────────────────────────────
SCREEN NAME
──────────────────────────────────────
[The screen where the bug was found, e.g., "Create Workout", "Groups List"]

──────────────────────────────────────
STEPS TO REPRODUCE
──────────────────────────────────────
1.
2.
3.
[Be specific — include exact taps, inputs typed, and account type used]

──────────────────────────────────────
EXPECTED BEHAVIOR
──────────────────────────────────────
[What should have happened]

──────────────────────────────────────
ACTUAL BEHAVIOR
──────────────────────────────────────
[What actually happened — include any error messages verbatim]

──────────────────────────────────────
SEVERITY
──────────────────────────────────────
[ ] Critical  — App crash, data loss, cannot complete core flow, security issue
[ ] Major     — Feature broken or completely inaccessible, wrong data shown
[ ] Minor     — Feature works but behaves incorrectly in edge case
[ ] UI        — Visual glitch, misalignment, wrong text/colour, animation issue

──────────────────────────────────────
REPRODUCIBILITY
──────────────────────────────────────
[ ] Always     — Happens 100% of the time
[ ] Often      — Happens > 50% of attempts
[ ] Sometimes  — Happens < 50% of attempts
[ ] Once       — Only observed once, unable to reproduce

──────────────────────────────────────
ACCOUNT TYPE AT TIME OF BUG
──────────────────────────────────────
[ ] Athlete Free
[ ] Athlete Pro
[ ] Coach Pro
[ ] Not logged in

──────────────────────────────────────
SCREENSHOT / RECORDING
──────────────────────────────────────
[Attach screenshot or screen recording. Annotate with arrows if helpful.]
File:

══════════════════════════════════════
```

---

## 8. Developer Attention Required

The following issues were inferred from the code and may affect test results or represent incomplete functionality. Testers should be aware that these areas may behave unexpectedly.

---

### DEV-001 — Workout Results Screen: Potentially Missing Imports
**File:** `app/workout/results.tsx`  
**Issue:** The screen appears to reference `authService`, `storage`, and `globalState` that may not be imported. If completion tracking does not work (TC-WOD-012), this is the likely cause.  
**Impact:** Completing a workout and logging results may silently fail or crash.  
**Recommended test:** Attempt TC-WOD-012 and check whether results are persisted after navigating away.

---

### DEV-002 — Custom Timer Intervals UI Not Confirmed
**File:** `app/(tabs)/timer.tsx`, timer components  
**Issue:** The feature flag `customTimerIntervals` exists and is gated to Athlete Pro+, but the actual UI controls for configuring custom intervals were not verified in the timer setup screen. It is possible the UI is present but was not surfaced in exploration.  
**Impact:** TC-TMR-004 and TC-TMR-005 may fail to find the custom interval controls.  
**Recommended test:** Carefully inspect every option on the Timer setup screen as an Athlete Pro user and flag if controls are absent.

---

### DEV-003 — PR Share Sticker: Implementation Not Confirmed
**File:** `app/pr/[id].tsx`  
**Issue:** The feature flag `prShareSticker` exists and is gated to Athlete Pro+, but the actual sticker generation or native share-sheet integration was not confirmed in the screen code.  
**Impact:** TC-PR-007 and TC-PR-008 may not find a visible share button on the PR detail screen.  
**Recommended test:** Open a PR detail screen as Athlete Pro and look for any share, export, or sticker button. Report if absent.

---

### DEV-004 — "What's New" Feature is Commented Out
**File:** `app/(tabs)/profile.tsx` (lines ~291–295)  
**Issue:** A "What's New" row with a `sparkles` icon is commented out in the Profile screen. It was showing a "Coming soon" alert.  
**Impact:** Not a functional bug, but testers should not expect to see this row.

---

### DEV-005 — Voice Workout Monthly Count Persistence
**File:** `hooks/useRevenueCat.ts`, `lib/voiceUsage.ts`  
**Issue:** Voice usage count is stored in AsyncStorage and reset monthly. There is no confirmed error handling if the AsyncStorage read/write fails. On a fresh install, the count resets regardless of actual monthly usage.  
**Impact:** Free tier users could potentially bypass the 5/month voice limit by reinstalling the app.  
**Recommended test:** Use all 5 voice inputs as a Free user, then check if the 6th is blocked (TC-WOD-008). Also test: after uninstalling and reinstalling without changing account, do they get 5 more voice inputs?

---

### DEV-006 — Cannot Edit Exercises in Structured Workout Edit Mode
**File:** `app/workout/[id].tsx`  
**Issue:** The edit mode for structured workouts is limited to editing the title and exercise instructions. Users cannot add new exercises, remove existing exercises, or change the tracking type after a workout is created.  
**Impact:** Testers should not expect full exercise editing on TC-WOD-010. If a tester attempts to add/remove exercises in edit mode and it does not work, this is known behavior, not a new bug.

---

### DEV-007 — No Deep Linking from Notifications
**File:** `hooks/useNotifications.ts`  
**Issue:** Notification registration and channel setup is implemented, but there is no confirmed notification routing (deep linking) — tapping a notification from the OS may only open the app to the home screen rather than the relevant content.  
**Impact:** Not testable without a backend trigger, but worth noting if notification routing is expected.

---

### DEV-008 — Badge Count Disabled
**File:** `hooks/useNotifications.ts`  
**Issue:** `shouldSetBadge: false` is hardcoded in the notification handler, so the app icon badge count will never update.  
**Impact:** If badge counts are expected as a feature, they will not appear. This is likely intentional but should be confirmed.

---

### DEV-009 — TODO in Join Group Screen
**File:** `app/group/join.tsx` (~line 30)  
**Issue:** A TODO comment exists in the join group screen. The exact nature of the TODO was not determined.  
**Recommended test:** Test TC-GRP-006 through TC-GRP-009 thoroughly and report any unexpected behavior in the join flow.

---

*End of WODGoat QA Testing Guide v1.0*
