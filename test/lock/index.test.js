import expect from 'expect.js';
import Immutable from 'immutable';
import * as l from '../../src/lock/index';
import { iconUrl } from '../../src/icon/index';

let lock;

const clientID = "someClientID";
const lockID = "someLockID";
const domain = "tenant.auth0.com";

describe("initializing a lock", function() {
  beforeEach(function() {
    lock = l.setup({
      clientID: clientID,
      domain: domain,
      id: lockID,
      nonexistent: "nonexistent"
    });
  });

  it("sets the id", function() {
    expect(l.id(lock)).to.be(lockID);
  });

  it("sets the client id", function() {
    expect(l.clientID(lock)).to.be(clientID);
  });

  it("sets the domain", function() {
    expect(l.domain(lock)).to.be(domain);
  });

  it("doesn't set unknown attributes", function() {
    expect(lock.get("nonexistent")).to.be(undefined);
  });

  it("doesn't set any mode", function() {
    expect(l.mode(lock)).to.be(undefined);
  });

  it("doesn't need to be shown", function() {
    expect(l.show(lock)).to.be(false);
  });

  it("isn't submitting", function() {
    expect(l.submitting(lock)).to.be(false);
  });

  it("doesn't have a global error", function() {
    expect(l.globalError(lock)).to.be("");
  });

  it("doesn't need to be rendered", function() {
    expect(l.rendering(lock)).to.be(false);
  });
});

describe("rendering a lock", function() {
  let renderedLock;
  const mode = "someMode";
  const modeOptions = {someModeOption: "someModeOption"};

  beforeEach(function() {
    lock = l.setup({clientID: clientID, domain: domain, id: lockID});
    renderedLock = l.render(lock, mode, {modeOptions: modeOptions});
  });

  it("sets the mode", function() {
    expect(l.mode(renderedLock)).to.be(mode);
  });

  it("sets the mode options", function() {
    expect(l.modeOptions(renderedLock).toJS()).to.eql(modeOptions);
  });

  it("it isn't being shown yet", function() {
    expect(l.show(renderedLock)).to.be(false);
  });

  it("needs to be rendered", function() {
    expect(l.rendering(renderedLock)).to.be(true);
  });

  it("choses a container id automatically", function() {
    expect(l.ui.containerID(renderedLock)).to.be(`auth0-lock-container-${l.id(lock)}`);
  });

  it("can append a container when needed", function() {
    expect(l.ui.appendContainer(renderedLock)).to.be(true);
  });

  it("uses the auth0 logo", function() {
    expect(l.ui.icon(renderedLock)).to.be(iconUrl("auth0"));
  });

  it("can be closed", function() {
    expect(l.ui.closable(renderedLock)).to.be(true);
  });

  // TODO: focusInput test, but remove isSmallScreen dependency first

  it("displays user name and picture obtained from Gravatar", function() {
    expect(l.ui.gravatar(renderedLock)).to.be(true);
  });

  describe("with ui option", function() {
    describe("`container`", function() {
      const container = "someId";

      beforeEach(function() {
        renderedLock = l.render(lock, mode, {container: container});
      });

      it("assings it as the container id", function() {
        expect(l.ui.containerID(renderedLock)).to.be(container);
      });

      it("prohibits appending a container", function() {
        expect(l.ui.appendContainer(renderedLock)).to.be(false);
      });

      it("doesn't allow to close it (by default)", function() {
        expect(l.ui.closable(renderedLock)).to.be(false);
      });

      // TODO: focusInput test, but (again) remove isSmallScreen dependency first
    });

    describe("`appendContainer`", function() {
      beforeEach(function() {
        renderedLock = l.render(lock, mode, {appendContainer: false});
      });

      it("doesn't affect whether a container can be appended or not", function() {
        expect(l.ui.appendContainer(renderedLock)).to.be(true);
      });
    });

    describe("`icon`", function() {
      const icon = "my_company_icon.svg";

      beforeEach(function() {
        renderedLock = l.render(lock, mode, {icon: icon});
      });

      it("sets a customs icon", function() {
        expect(l.ui.icon(renderedLock)).to.be(icon);
      });
    });

    describe("`closable`", function() {
      describe("without `container`", function() {
        beforeEach(function() {
          renderedLock = l.render(lock, mode, {closable: false});
        });

        it("can stop the user from closing the lock", function() {
          expect(l.ui.closable(renderedLock)).to.be(false);
        });
      });

      describe("with `container`", function() {
        beforeEach(function() {
          renderedLock = l.render(lock, mode, {closable: true, container: "someId"});
        })

        it("allows the user to close the lock (even inside a container)", function() {
          expect(l.ui.closable(renderedLock)).to.be(true);
        });
      });
    });

    // TODO: focusInput test, but (again) remove isSmallScreen dependency first

    describe("`gravatar`", function() {
      beforeEach(function() {
        renderedLock = l.render(lock, mode, {gravatar: false});
      });

      it("doesn't display user name and picture obtained from Gravatar", function() {
        expect(l.ui.gravatar(renderedLock)).to.be(false);
      });
    });
  });


  describe("then opening it", function() {
    let openedLock;
    beforeEach(function() {
      openedLock = l.setShow(renderedLock, true);
    });

    it("needs to be shown now", function() {
      expect(l.show(openedLock)).to.be(true);
    });

    describe("and closing it", function() {
      let closedLock;
      beforeEach(function() {
        closedLock = l.close(openedLock);
      })

      it("doesn't need to be shown anymore", function() {
        expect(l.show(closedLock)).to.be(false);
      });

      it("still needs to be rendered", function() {
        expect(l.rendering(closedLock)).to.be(true);
      });
    });
  });
});

describe("rerendering a lock", function() {
  let renderedLock, reRenderedLock;
  const mode = "someMode";
  // const modeOptions = {someModeOption: "someModeOption"};

  beforeEach(function() {
    lock = l.setup({clientID: clientID, domain: domain, id: lockID});
    renderedLock = l.render(lock, mode, {});
    reRenderedLock = l.render(renderedLock, mode, {});
  });

  it("doesn't change the container id", function() {
    expect(l.ui.containerID(reRenderedLock)).to.be(l.ui.containerID(renderedLock));
  });

  it("doesn't change whether it allows to append a container or not", function() {
    expect(l.ui.appendContainer(reRenderedLock)).to.be(l.ui.appendContainer(renderedLock));
  });

  it("doesn't change the icon", function() {
    expect(l.ui.icon(reRenderedLock)).to.be(l.ui.icon(renderedLock));
  });

  it("doesn't change whether it can be closed or not", function() {
    expect(l.ui.closable(reRenderedLock)).to.be(l.ui.closable(renderedLock));
  });

  // TODO: focusInput test, but (again) remove isSmallScreen dependency first

  it("doesn't change whether it displays info obtained from Gravatar or not", function() {
    expect(l.ui.gravatar(reRenderedLock)).to.be(l.ui.gravatar(renderedLock));
  });

  describe("with UI option", function() {
    const reopenOptions = {
      container: "someId",
      icon: "my_company_icon.svg",
      closable: false,
      gravatar: false
    };

    describe("`container`", function() {
      beforeEach(function() {
        reRenderedLock = l.render(renderedLock, mode, {container: reopenOptions.container});
      });

      it("doesn't change the container's id", function() {
        expect(l.ui.containerID(reRenderedLock)).to.be(l.ui.containerID(renderedLock));
        expect(l.ui.containerID(reRenderedLock)).to.not.be(reopenOptions.container); // sanity check
      });

      it("doesn't affect whether a container can be appended or not", function() {
        expect(l.ui.appendContainer(reRenderedLock)).to.be(l.ui.appendContainer(renderedLock));
        expect(l.ui.appendContainer(reRenderedLock)).to.be(true); // sanity check
      });

      it("doesn't change whether it can be closed or not", function() {
        expect(l.ui.closable(reRenderedLock)).to.be(l.ui.closable(renderedLock));
        expect(l.ui.closable(reRenderedLock)).to.be(true); // sanity check
      });
    });

    describe("`appendContainer`", function() {
      beforeEach(function() {
        reRenderedLock = l.render(renderedLock, mode, {appendContainer: false});
      });

      it("doesn't affect whether a container can be appended or not", function() {
        expect(l.ui.appendContainer(reRenderedLock)).to.be(l.ui.appendContainer(renderedLock));
        expect(l.ui.appendContainer(reRenderedLock)).to.be(true); // sanity check
      });
    });

    describe("`icon`", function() {
      beforeEach(function() {
        reRenderedLock = l.render(renderedLock, mode, {icon: reopenOptions.icon});
      });

      it("changes the icon", function() {
        expect(l.ui.icon(reRenderedLock)).to.be(reopenOptions.icon);
        expect(l.ui.icon(renderedLock)).to.not.be(reopenOptions.icon); // sanity check
      });
    });

    describe("`closable`", function() {
      beforeEach(function() {
        reRenderedLock = l.render(renderedLock, mode, {closable: reopenOptions.closable});
      });

      it("changes whether it can be closed or not", function() {
        expect(l.ui.closable(reRenderedLock)).to.be(reopenOptions.closable);
        expect(l.ui.closable(renderedLock)).to.not.be(reopenOptions.closable); // sanity check
      });
    });

    // TODO: focusInput test, but (again) remove isSmallScreen dependency first

    describe("`gravatar`", function() {
      beforeEach(function() {
        reRenderedLock = l.render(renderedLock, mode, {gravatar: reopenOptions.gravatar});
      });

      it("changes whether it displays info obtained from Gravatar or not", function() {
        expect(l.ui.gravatar(reRenderedLock)).to.be(reopenOptions.gravatar);
        expect(l.ui.gravatar(renderedLock)).to.not.be(reopenOptions.gravatar); // sanity check
      });
    });
  });

  describe("in another mode", function() {
    const otherMode = "otherMode";
    let notRerenderedLock;

    beforeEach(function() {
      notRerenderedLock = l.render(reRenderedLock, otherMode, {gravatar: false});
    });

    it("doesn't change anything", function() {
      expect(reRenderedLock).to.be(notRerenderedLock);
    });
  });
});

describe("trying to render a lock that is being shown", function() {
  let openedLock, reRenderedLock;
  const mode = "someMode";

  beforeEach(function() {
    lock = l.setup({clientID: clientID, domain: domain, id: lockID});
    openedLock = l.setShow(l.render(lock, mode, {}), true);
    reRenderedLock = l.render(openedLock, mode, {gravatar: false});
  });

  it("doesn't change anything", function() {
    expect(reRenderedLock).to.be(openedLock);
  });
});

describe("submitting", function() {
  let lockWithGlobalError, submittingLock;
  const globalError = "Something went wrong.";

  beforeEach(function() {
    lock = l.setup({clientID: clientID, domain: domain, id: lockID});
    lockWithGlobalError = l.setGlobalError(lock, globalError);
    submittingLock = l.setSubmitting(lockWithGlobalError, true);
  });

  it("updates the submit status", function() {
    expect(l.submitting(submittingLock)).to.be(true);
    expect(l.submitting(lockWithGlobalError)).to.be(false); // sanity check
  });

  it("clears the global error", function() {
    expect(l.globalError(submittingLock)).to.be("");
  });

  describe("providing a global error", function() {
    beforeEach(function() {
      // TODO: this is confusing, split `setSubmitting` into `startSubmit` and
      // `stopSubmit`.
      submittingLock = l.setSubmitting(lockWithGlobalError, true, globalError)
    });

    it("updates the submit status", function() {
      expect(l.submitting(submittingLock)).to.be(true);
      expect(l.submitting(lockWithGlobalError)).to.be(false); // sanity check
    });

    it("clears the global error anyway", function() {
      expect(l.globalError(submittingLock)).to.be("");
      expect(globalError).to.not.be(""); // sanity check
    });
  });

  describe("a successful request", function() {
    beforeEach(function() {
      submittingLock = l.setSubmitting(lock, false);
    });

    it("updates the submit status", function() {
      expect(l.submitting(submittingLock)).to.be(false);
    });

    it("doesn't record any global error", function() {
      expect(l.globalError(submittingLock)).to.be("");
    });
  });

  describe("an unsuccessful request", function() {
    beforeEach(function() {
      submittingLock = l.setSubmitting(lock, false, globalError);
    });

    it("updates the submit status", function() {
      expect(l.submitting(submittingLock)).to.be(false);
    });

    it("records a global error", function() {
      expect(l.globalError(submittingLock)).to.be(globalError);
    });

  });
});

describe("accessing Gravatar info", function() {
  const gravatar = Immutable.fromJS({displayName: "someName", imageUrl: "someUrl"});
  const mode = "someMode";
  let renderedLock;

  beforeEach(function() {
    lock = l.setup({clientID: clientID, domain: domain, id: lockID});
  });

  describe("when it has to be displayed", function() {
    beforeEach(function() {
      renderedLock = l.render(lock, mode, {gravatar: true});
    });

    describe("and it isn't available", function() {
      it("returns undefined", function() {
        expect(l.gravatar(renderedLock)).to.be(undefined);
      });
    });

    describe("and it is available", function() {
      beforeEach(function() {
        renderedLock = renderedLock.set("gravatar", gravatar);
      });

      it("returns it", function() {
        expect(l.gravatar(renderedLock)).to.be(gravatar);
      });
    });
  });

  describe("when available but it doesn't have to be displayed", function() {
    beforeEach(function() {
      renderedLock = l.render(lock, mode, {gravatar: false});
      renderedLock = renderedLock.set("gravatar", gravatar);
    });

    it("returns undefined", function() {
      expect(l.gravatar(renderedLock)).to.be(undefined);
    });
  });
});
