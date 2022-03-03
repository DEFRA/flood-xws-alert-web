AWS_PROFILE ?= defra-dev-sandpit

syncData:
	aws s3 cp s3://xws-alert-$(ENV)-files/alerts/alert-type.json ./server/data/alert-type.json --profile $(AWS_PROFILE)
	aws s3 cp s3://xws-alert-$(ENV)-files/areas/target-area-category.json ./server/data/target-area-category.json --profile $(AWS_PROFILE)
	aws s3 cp s3://xws-alert-$(ENV)-files/areas/target-area-type.json ./server/data/target-area-type.json --profile $(AWS_PROFILE)
	aws s3 cp s3://xws-alert-$(ENV)-files/areas/ea-area.json ./server/data/ea-area.json --profile $(AWS_PROFILE)
	aws s3 cp s3://xws-alert-$(ENV)-files/areas/ea-owner.json ./server/data/ea-owner.json --profile $(AWS_PROFILE)
	aws s3 cp s3://xws-alert-$(ENV)-files/areas/target-area.json ./server/data/target-area.json --profile $(AWS_PROFILE)
