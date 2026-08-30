import React, { useState } from 'react';

function LoginPage({
  lang,
  goToPage,
  user,
  handleLineLogin,
  handleLogout
}) {
  const th = lang === 'th';

  const isAdmin =
    user && user.isAdmin === true;

  const [profileImageError, setProfileImageError] =
    useState(false);

  return (
    <div className="guidePage loginPage">
      <style>{`
        .loginPage {
          padding: 48px 18px 72px;
          background:
            radial-gradient(
              circle at 50% 0%,
              rgba(169, 121, 41, .05),
              transparent 34%
            ),
            #faf8f3;
        }

        .loginContainer {
          max-width: 760px !important;
          padding: 42px 46px 48px !important;
          border: 1px solid #e8dece;
          border-radius: 10px;
          background: #fffefb;
          box-shadow:
            0 14px 40px rgba(70, 48, 26, .045);
        }

        .loginHero {
          max-width: 640px;
          margin: 22px auto 30px;
          text-align: center;
        }

        .loginHeroIcon {
          width: 40px;
          height: 40px;
          margin: 0 auto 12px;
          display: block;
        }

        .loginHero .eyebrow {
          display: block;
          margin-bottom: 12px;
          text-align: center;
        }

        .loginHero h1 {
          margin: 0 0 13px;
          color: #3d3025;
          font-size: clamp(2rem, 4.3vw, 2.85rem);
          font-weight: 500;
          line-height: 1.16;
          letter-spacing: -.02em;
          text-align: center;
        }

        .loginHeroOrnament {
          margin: 16px auto 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 11px;
        }

        .loginHeroOrnament span {
          width: 48px;
          height: 1px;
          background: #dcc49d;
        }

        .loginHeroOrnament img {
          width: 22px;
          height: 22px;
        }

        .loginHero p {
          max-width: 600px;
          margin: 0 auto;
          color: #766b61;
          font-size: 14px;
          line-height: 1.85;
          text-align: center;
        }

        .loginPanel {
          max-width: 620px;
          margin: 0 auto;
          padding: 30px;
          border: 1px solid #e7dccd;
          border-radius: 10px;
          background:
            linear-gradient(
              180deg,
              #fffdfa 0%,
              #faf7f0 100%
            );
          text-align: center;
        }

        .loginPanelIcon {
          width: 46px;
          height: 46px;
          margin: 0 auto 18px;
          padding: 9px;
          display: grid;
          place-items: center;
          border: 1px solid #dfcfb4;
          border-radius: 50%;
          background: #fff8ec;
        }

        .loginPanelIcon img {
          width: 27px;
          height: 27px;
        }

        .lineLoginBtn {
          width: 100%;
          min-height: 52px;
          padding: 13px 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          border: 0;
          border-radius: 999px;
          background: #06c755;
          color: #fff;
          font-family: inherit;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          box-shadow:
            0 8px 18px rgba(6, 199, 85, .18);
        }

        .lineLoginDot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #fff;
        }

        .studentLoginBtn {
          width: 100%;
          min-height: 50px;
          margin-top: 12px;
          padding: 12px 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          border: 1px solid #d8c49a;
          border-radius: 999px;
          background: #fff;
          color: #8d6626;
          font-family: inherit;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }

        .studentLoginBtn:hover {
          background: #fff8ec;
        }

        .loginHelpText {
          max-width: 510px;
          margin: 18px auto 0;
          color: #6f655c;
          font-size: 12.5px;
          line-height: 1.75;
        }

        .studentLoginTextLink {
          display: block;
          margin: 18px auto 0;
          padding: 0;
          border: 0;
          background: transparent;
          color: #9b7226;
          font-family: inherit;
          font-size: 11.5px;
          font-weight: 500;
          text-decoration: underline;
          text-underline-offset: 3px;
          cursor: pointer;
        }

        .studentLoginTextLink:hover {
          color: #6f4e18;
        }

        .loginPrivacyText {
          max-width: 500px;
          margin: 16px auto 0;
          padding-top: 15px;
          border-top: 1px solid #ebe2d6;
          color: #948b82;
          font-size: 11px;
          line-height: 1.7;
        }

        .loginUserCard {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .loginAvatar {
          width: 82px;
          height: 82px;
          margin-bottom: 15px;
          overflow: hidden;
          display: grid;
          place-items: center;
          border: 1px solid #dfd4c4;
          border-radius: 50%;
          background: #f2eadc;
        }

        .loginAvatar img:not(.loginAvatarFallback) {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
        }

        .loginAvatarFallback {
          width: 34px;
          height: 34px;
        }

        .loginWelcome {
          margin: 0;
          color: #3e332b;
          font-size: 21px;
          font-weight: 500;
        }

        .loginSuccessText {
          max-width: 500px;
          margin: 8px auto 0;
          color: #6e645c;
          font-size: 13px;
          line-height: 1.7;
        }

        .loginRoleBadge {
          margin-top: 16px;
          padding: 7px 12px;
          border: 1px solid #dfcfb4;
          border-radius: 999px;
          background: #fff8ec;
          color: #8d6626;
          font-size: 11px;
          font-weight: 600;
        }

        .loginRoleBadge.member {
          border-color: #dce6d8;
          background: #f4f8f2;
          color: #5b7655;
        }

        .loginActions {
          width: 100%;
          margin-top: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .loginAdminBtn {
          min-height: 44px;
          padding: 11px 18px;
          border: 0;
          border-radius: 6px;
          background: #9b7226;
          color: #fff;
          font-family: inherit;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }

        .loginLogoutBtn {
          min-height: 44px;
          padding: 11px 18px;
          border: 1px solid #d6cabc;
          border-radius: 6px;
          background: #fff;
          color: #756a60;
          font-family: inherit;
          font-size: 13px;
          cursor: pointer;
        }

        .loginMemberShortcut {
          width: 100%;
          margin-top: 20px;
          padding-top: 18px;
          border-top: 1px solid #ebe2d6;
        }

        .loginMemberShortcut button {
          min-height: 44px;
          padding: 10px 18px;
          border: 1px solid #d8c49a;
          border-radius: 999px;
          background: #fff;
          color: #8d6626;
          font-family: inherit;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }

        @media (max-width: 680px) {
          .loginPage {
            padding: 24px 10px 44px;
          }

          .loginContainer {
            width: 100%;
            padding: 26px 18px 32px !important;
            border-radius: 8px;
          }

          .loginHero {
            margin-top: 20px;
            margin-bottom: 24px;
          }

          .loginHeroIcon {
            width: 34px;
            height: 34px;
          }

          .loginHero h1 {
            font-size:
              clamp(1.9rem, 8.8vw, 2.35rem);
          }

          .loginHero p {
            font-size: 13px;
            line-height: 1.75;
            text-align: left;
          }

          .loginPanel {
            padding: 24px 18px;
          }

          .loginPanelIcon {
            width: 42px;
            height: 42px;
            margin-bottom: 16px;
          }

          .lineLoginBtn {
            min-height: 50px;
            font-size: 15px;
          }

          .loginHelpText {
            font-size: 12px;
          }

          .loginPrivacyText {
            font-size: 10.5px;
          }

          .loginAvatar {
            width: 72px;
            height: 72px;
          }

          .loginWelcome {
            font-size: 19px;
          }

          .loginActions {
            flex-direction: column;
          }

          .loginActions > button {
            width: 100%;
          }

          .loginMemberShortcut button {
            width: 100%;
          }
        }
      `}</style>

      <div
        className="guideContainer loginContainer"
      >
        <button
          className="backButton"
          onClick={() =>
            goToPage('home')
          }
        >
          {th
            ? '← กลับสู่หน้าหลัก'
            : '← Back to Home'}
        </button>

        <div className="loginHero">
          <img
            src="/icons/dhamma-wheel.svg"
            alt=""
            className="loginHeroIcon"
            aria-hidden="true"
          />

          <span className="eyebrow">
            NATHOENG CONNECT
          </span>

          <h1>
            {th
              ? 'เข้าสู่ระบบสมาชิก'
              : 'Member Login'}
          </h1>

          <div
            className="loginHeroOrnament"
            aria-hidden="true"
          >
            <span></span>
            <img
              src="/icons/lotus.svg"
              alt=""
            />
            <span></span>
          </div>

          <p>
            {th
              ? 'เข้าสู่ระบบด้วยบัญชี LINE เพื่อจัดการข้อมูลการเข้าพักปฏิบัติธรรม ดูประวัติการทำบุญ และใช้บริการสมาชิกของวัด'
              : 'Sign in with your LINE account to manage retreat stays, view donation history and access monastery member services.'}
          </p>
        </div>

        <div className="loginPanel">
          <div className="loginPanelIcon">
            <img
              src={
                user
                  ? '/icons/contact.svg'
                  : '/icons/dhamma-wheel.svg'
              }
              alt=""
              aria-hidden="true"
            />
          </div>

          {user ? (
            <div className="loginUserCard">
              <div className="loginAvatar">
                {user.picture &&
                !profileImageError ? (
                  <img
                    src={user.picture}
                    alt={
                      user.name ||
                      'LINE User'
                    }
                    referrerPolicy="no-referrer"
                    onError={() =>
                      setProfileImageError(
                        true
                      )
                    }
                  />
                ) : (
                  <img
                    src="/icons/meditation.svg"
                    alt=""
                    aria-hidden="true"
                    className="loginAvatarFallback"
                  />
                )}
              </div>

              <h3 className="loginWelcome">
                {th
                  ? `ยินดีต้อนรับ ${user.name || 'สมาชิก'}`
                  : `Welcome, ${user.name || 'Member'}`}
              </h3>

              <p className="loginSuccessText">
                {th
                  ? 'ท่านได้เข้าสู่ระบบสมาชิกของวัดผ่าน LINE เรียบร้อยแล้ว'
                  : 'You are successfully signed in to the monastery member system with LINE.'}
              </p>

              <div
                className={
                  isAdmin
                    ? 'loginRoleBadge'
                    : 'loginRoleBadge member'
                }
              >
                {isAdmin
                  ? th
                    ? 'บัญชีผู้ดูแลระบบ'
                    : 'Administrator Account'
                  : th
                  ? 'บัญชีสมาชิกทั่วไป'
                  : 'Standard Member Account'}
              </div>

              <div className="loginActions">
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() =>
                      goToPage(
                        'admin-dashboard'
                      )
                    }
                    className="loginAdminBtn"
                  >
                    {th
                      ? '⚙ ไปยังแผงควบคุมผู้ดูแลระบบ'
                      : '⚙ Go to Admin Dashboard'}
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="loginLogoutBtn"
                >
                  {th
                    ? 'ออกจากระบบ'
                    : 'Logout'}
                </button>
              </div>

              {!isAdmin && (
                <div className="loginMemberShortcut">
                  <button
                    type="button"
                    onClick={() =>
                      goToPage(
                        'my-dashboard'
                      )
                    }
                  >
                    {th
                      ? 'ไปยังบัญชีของฉัน →'
                      : 'Go to My Account →'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={handleLineLogin}
                className="lineLoginBtn"
              >
                <span
                  className="lineLoginDot"
                  aria-hidden="true"
                ></span>

                <span>
                  {th
                    ? 'เข้าสู่ระบบด้วย LINE'
                    : 'Login with LINE'}
                </span>
              </button>



              <p className="loginHelpText">
                {th
                  ? 'ระบบจะใช้บัญชี LINE เพื่อยืนยันตัวตนก่อนทำรายการจองเข้าพักและใช้บริการสมาชิกของวัด'
                  : 'LINE is used to verify your identity before booking a monastery stay or accessing member services.'}
              </p>

              <p className="loginPrivacyText">
                {th
                  ? 'การเข้าสู่ระบบถือว่าท่านยอมรับนโยบายความเป็นส่วนตัวและเงื่อนไขการใช้งานของทางวัด'
                  : 'By logging in, you accept the monastery privacy policy and terms of use.'}
              </p>

              <button
                type="button"
                className="studentLoginTextLink"
                onClick={() =>
                  goToPage('student-login')
                }
              >
                {th
                  ? 'สำหรับเด็กวัด'
                  : 'For Temple Students'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
