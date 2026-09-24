import hashlib,json
def a(x):return '0x'+bytes(x).hex()
def h(x):return hashlib.sha256(x.encode()).hexdigest()
C='1'*40
OLD='# API v1\nGET /users uses API keys and legacy error envelopes.'
NEW='# API v2\nGET /accounts uses OAuth and RFC 9457 errors.'
POL='# Policy\nMap endpoints, migrate auth, test errors, regression and rollback.'
EV='# Consumer migration\nservice=core revision=1; mapped users to accounts; OAuth active; error and regression tests pass; rollback tested.'
def u(repo,name):return f'https://raw.githubusercontent.com/{repo}/{C}/{name}.md'
def setup(c,vm,o,x,y):
    c.create_revision('core',1,a(y),'org/service',u('org/service','old'),h(OLD),len(OLD),u('org/service','new'),h(NEW),len(NEW),u('org/service','policy'),h(POL),len(POL),'a'*64)
    c.add_consumer(a(o),'core',1,'alpha',a(x),'alpha/client');c.add_consumer(a(o),'core',1,'beta',a(y),'beta/client');return c.seal_revision(a(o),'core',1)
def mocks(vm,v='READY',consumer_id='alpha'):
    vm.mock_web(r'old.md',{'method':'GET','status':200,'body':OLD});vm.mock_web(r'new.md',{'method':'GET','status':200,'body':NEW});vm.mock_web(r'policy.md',{'method':'GET','status':200,'body':POL});vm.mock_web(r'evidence.md',{'method':'GET','status':200,'body':EV});vm.mock_llm(rf'EXPECTED service_id=core; revision=1; consumer_id={consumer_id};',json.dumps({'verdict':v}))
def test_schema(direct_deploy):assert json.loads(direct_deploy('contracts/sunset_quorum.py').get_contract_version())['version']==1
def test_requires_two_consumers(direct_deploy,direct_vm,direct_owner,direct_alice,direct_bob):
 c=direct_deploy('contracts/sunset_quorum.py');c.create_revision('core',1,a(direct_bob),'org/service',u('org/service','old'),h(OLD),len(OLD),u('org/service','new'),h(NEW),len(NEW),u('org/service','policy'),h(POL),len(POL),'a'*64);c.add_consumer(a(direct_owner),'core',1,'alpha',a(direct_alice),'alpha/client')
 with direct_vm.expect_revert('AT_LEAST_TWO_CONSUMERS_REQUIRED'):c.seal_revision(a(direct_owner),'core',1)
def test_consent_and_quorum_lifecycle(direct_deploy,direct_vm,direct_owner,direct_alice,direct_bob):
 c=direct_deploy('contracts/sunset_quorum.py');d=setup(c,direct_vm,direct_owner,direct_alice,direct_bob)
 with direct_vm.prank(direct_alice):c.consent(a(direct_owner),'core',1,'alpha',d);c.submit_evidence(a(direct_owner),'core',1,'alpha',u('alpha/client','evidence'),h(EV),len(EV),'n-alpha')
 mocks(direct_vm);assert c.assess_consumer(a(direct_owner),'core',1,'alpha')=='READY'
 with direct_vm.prank(direct_bob),direct_vm.expect_revert('QUORUM_NOT_READY'):c.execute_shutdown(a(direct_owner),'core',1,'a'*64,'early')
 with direct_vm.prank(direct_bob):c.consent(a(direct_owner),'core',1,'beta',d);c.submit_evidence(a(direct_owner),'core',1,'beta',u('beta/client','evidence'),h(EV),len(EV),'n-beta')
 mocks(direct_vm,consumer_id='beta');assert c.assess_consumer(a(direct_owner),'core',1,'beta')=='READY'
 with direct_vm.prank(direct_bob):receipt=c.execute_shutdown(a(direct_owner),'core',1,'a'*64,'execute');
 assert json.loads(c.get_revision(a(direct_owner),'core',1))['receipt']==receipt
def test_wrong_actor_and_digest_rejected_without_state(direct_deploy,direct_vm,direct_owner,direct_alice,direct_bob):
 c=direct_deploy('contracts/sunset_quorum.py');d=setup(c,direct_vm,direct_owner,direct_alice,direct_bob);before=c.get_consumer(a(direct_owner),'core',1,'alpha')
 with direct_vm.prank(direct_bob),direct_vm.expect_revert('CONSUMER_ONLY'):c.consent(a(direct_owner),'core',1,'alpha',d)
 assert c.get_consumer(a(direct_owner),'core',1,'alpha')==before
 with direct_vm.prank(direct_alice),direct_vm.expect_revert('TERMS_DIGEST_MISMATCH'):c.consent(a(direct_owner),'core',1,'alpha','b'*64)
 assert c.get_consumer(a(direct_owner),'core',1,'alpha')==before
def test_partial_never_authorizes(direct_deploy,direct_vm,direct_owner,direct_alice,direct_bob):
 c=direct_deploy('contracts/sunset_quorum.py');d=setup(c,direct_vm,direct_owner,direct_alice,direct_bob)
 with direct_vm.prank(direct_alice):c.consent(a(direct_owner),'core',1,'alpha',d);c.submit_evidence(a(direct_owner),'core',1,'alpha',u('alpha/client','evidence'),h(EV),len(EV),'n-alpha')
 mocks(direct_vm,'PARTIAL');assert c.assess_consumer(a(direct_owner),'core',1,'alpha')=='PARTIAL';assert not json.loads(c.get_revision(a(direct_owner),'core',1))['authorized']

def test_deployer_has_no_role_in_other_controllers_revision(direct_deploy,direct_vm,direct_owner,direct_alice,direct_bob):
 c=direct_deploy('contracts/sunset_quorum.py')
 with direct_vm.prank(direct_alice):
  c.create_revision('core',1,a(direct_bob),'org/service',u('org/service','old'),h(OLD),len(OLD),u('org/service','new'),h(NEW),len(NEW),u('org/service','policy'),h(POL),len(POL),'a'*64)
 with direct_vm.expect_revert('CONTROLLER_ONLY'):c.add_consumer(a(direct_alice),'core',1,'alpha',a(direct_owner),'alpha/client')
 with direct_vm.expect_revert('CONSUMER_NOT_FOUND'):c.consent(a(direct_alice),'core',1,'alpha','a'*64)

def test_consumer_set_is_bound_into_terms(direct_deploy,direct_vm,direct_owner,direct_alice,direct_bob):
 c=direct_deploy('contracts/sunset_quorum.py');terms=setup(c,direct_vm,direct_owner,direct_alice,direct_bob);state=json.loads(c.get_revision(a(direct_owner),'core',1))
 assert len(state['consumer_set_digest'])==64 and state['consumer_set_digest']!=terms
 with direct_vm.expect_revert('REVISION_ALREADY_SEALED'):c.add_consumer(a(direct_owner),'core',1,'late',a(direct_owner),'late/client')

def test_wrong_repository_and_global_nonce_replay_rejected(direct_deploy,direct_vm,direct_owner,direct_alice,direct_bob):
 c=direct_deploy('contracts/sunset_quorum.py');d=setup(c,direct_vm,direct_owner,direct_alice,direct_bob)
 with direct_vm.prank(direct_alice):
  c.consent(a(direct_owner),'core',1,'alpha',d)
  with direct_vm.expect_revert('INVALID_EVIDENCE_URL'):c.submit_evidence(a(direct_owner),'core',1,'alpha',u('beta/client','evidence'),h(EV),len(EV),'shared')
  c.submit_evidence(a(direct_owner),'core',1,'alpha',u('alpha/client','evidence'),h(EV),len(EV),'shared')
 with direct_vm.prank(direct_owner):
  c.create_revision('core',2,a(direct_bob),'org/service',u('org/service','old'),h(OLD),len(OLD),u('org/service','new'),h(NEW),len(NEW),u('org/service','policy'),h(POL),len(POL),'b'*64)
  c.add_consumer(a(direct_owner),'core',2,'alpha',a(direct_alice),'alpha/client');c.add_consumer(a(direct_owner),'core',2,'beta',a(direct_bob),'beta/client');d2=c.seal_revision(a(direct_owner),'core',2)
 with direct_vm.prank(direct_alice):
  c.consent(a(direct_owner),'core',2,'alpha',d2)
  with direct_vm.expect_revert('NONCE_REPLAY'):c.submit_evidence(a(direct_owner),'core',2,'alpha',u('alpha/client','evidence'),h(EV),len(EV),'shared')

def test_execute_guards_and_double_consume(direct_deploy,direct_vm,direct_owner,direct_alice,direct_bob):
 c=direct_deploy('contracts/sunset_quorum.py');d=setup(c,direct_vm,direct_owner,direct_alice,direct_bob)
 for cid,actor,repo,nonce in [('alpha',direct_alice,'alpha/client','nonce-alpha'),('beta',direct_bob,'beta/client','nonce-beta')]:
  with direct_vm.prank(actor):c.consent(a(direct_owner),'core',1,cid,d);c.submit_evidence(a(direct_owner),'core',1,cid,u(repo,'evidence'),h(EV),len(EV),nonce)
  mocks(direct_vm,consumer_id=cid);assert c.assess_consumer(a(direct_owner),'core',1,cid)=='READY'
 before=c.get_revision(a(direct_owner),'core',1)
 with direct_vm.prank(direct_alice),direct_vm.expect_revert('OPERATOR_ONLY'):c.execute_shutdown(a(direct_owner),'core',1,'a'*64,'bad-actor')
 assert c.get_revision(a(direct_owner),'core',1)==before
 with direct_vm.prank(direct_bob),direct_vm.expect_revert('SHUTDOWN_DIGEST_MISMATCH'):c.execute_shutdown(a(direct_owner),'core',1,'b'*64,'bad-digest')
 assert c.get_revision(a(direct_owner),'core',1)==before
 with direct_vm.prank(direct_bob):c.execute_shutdown(a(direct_owner),'core',1,'a'*64,'once')
 with direct_vm.prank(direct_bob),direct_vm.expect_revert('SHUTDOWN_ALREADY_CONSUMED'):c.execute_shutdown(a(direct_owner),'core',1,'a'*64,'twice')
