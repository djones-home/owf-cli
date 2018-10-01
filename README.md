# OWF-CLI 

To configure owf via the rest interface, this cli will need to authenticate, with an admin role.
Normaly our OWF administrators (or users) are using x509 certificates, - TLS with 
mutual-authenitation - so this is for an instance of OWF configured for smartcards (AKA: CAC/PIV),
with sessions preauthenticated at the ssl-endpoint on a load-balancer (proxy). The proxy
forwards the end-user certificate via certian request header, to an AJP connector. Effectiviy allowing
applications use the certificate from the Tomcat connector, to establish the authenticated user, and authorities (roles). In the CI environment, this was written for,  one approach to automate the
creation of widgets, a localhost connector for admin was setup, trusting the cli certificate, see 
[jboss_admin_conn] function for details of the setup.
 
 
[Add a jboss 7 https connector] : http://middlewaremagic.com/jboss/?p=2390

[override X509AuthenicationFilter] :https://stackoverflow.com/questions/14717185/forwarding-client-certifcate-from-apache-to-tomcat

[getPreAuthenticationCredentials] :https://github.com/SpringSource/spring-security/blob/master/web/src/main/java/org/springframework/security/web/authentication/preauth/x509/X509AuthenticationFilter.java#L25

[jboss_admin_conn]: 
https://svn.nps.edu/repos/metocgis/infrastructure/continuous-integration/trunk/tools/bin/BuildSvr.func
