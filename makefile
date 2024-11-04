################################################################################
# App
################################################################################
.PHONY: container-build k8s-deploy k8s-delete k3d-create k3d-delete kubectl-info

# TODO: move to script and call from custom nx target
container-build:
	docker build -f apps/event-planning/deploy/Dockerfile -t ttrpg-event-planning-ui:latest .

k8s-deploy:
	k3d image import ttrpg-event-planning-ui:latest -c ttrpg
	kubectl apply -f ./apps/event-planning/deploy/deployment.yml
	kubectl apply -f ./apps/event-planning/deploy/service.yml

k8s-delete:
  kubectl delete pod -l app=ttrpg-event-planning-ui

k3d-create:
	k3d cluster create ttrpg

k3d-delete:
	k3d cluster delete ttrpg

kubectl-info:
	kubectl config get-contexts | grep "ttrpg-cluster"
	kubectl describe service ttrpg-event-planning-ui
	kubectl get services
	kubectl get pods