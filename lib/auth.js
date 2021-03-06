// www/utils/auth.js

import Router from "next/router";
import nextCookie from "next-cookies";
import cookie from "js-cookie";

export const logout = () => {
    cookie.remove("token");
    // To trigger the event listener we save some random data into the `logout` key
    window.localStorage.setItem("logout", Date.now()); // new
    Router.push("/login");
  };

export const auth = ctx => {
  const { token } = nextCookie(ctx);

  if (ctx.req && !token) {
    ctx.res.writeHead(302, { Location: "/login" });
    ctx.res.end();
    return;
  }

  if (!token) {
    Router.push("/login");
  }

  return token;
};

// Gets the display name of a JSX component for dev tools
const getDisplayName = Component =>
  Component.displayName || Component.name || "Component";

export const withAuthSync = WrappedComponent =>
  class extends Component {
    static displayName = `withAuthSync(${getDisplayName(WrappedComponent)})`;

    static async getInitialProps(ctx) {
      const token = auth(ctx);

      const componentProps =
        WrappedComponent.getInitialProps &&
        (await WrappedComponent.getInitialProps(ctx));

      return { ...componentProps, token };
    }

    render() {
      return <WrappedComponent {...this.props} />;
    }
  };
